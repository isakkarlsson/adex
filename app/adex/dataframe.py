import pandas as pd
import numpy as np
import collections, random
from datetime import datetime, timedelta


def load_dataset(drug_file="drugs", diag_file="diagnoses", patent_file="patients"):
    diagnoses = pd.read_table(diag_file, sep=',', parse_dates=[0], index_col=[1]).dropna()
    drugs = pd.read_table(drug_file, sep=',', parse_dates=[1], index_col=[0], usecols=[0, 1, 3]).dropna()
    patients = pd.read_table(patent_file, sep=',', index_col=[0]).dropna()
    patients.Age = 2010 - patients.Age
    return drugs, diagnoses, patients


def queries_from_list(l):
    queries = []
    for d in l:
        queries.append(query_from_dict(d))
    return queries


def query_from_dict(d):
    if isinstance(d, list):
        return queries_from_list(d)

    d = collections.defaultdict(list, d)
    q = Query()
    q.include_drugs = d["include_drugs"]
    q.exclude_drugs = d["exclude_drugs"]
    q.include_diags = d["include_diags"]
    q.exclude_diags = d["exclude_diags"]
    q.min_age = d["min_age"] if "min_age" in d else 0
    q.max_age = d["max_age"] if "max_age" in d else 120  # changed
    q.gender = d["gender"].lower() if "gender" in d else None
    if q.gender == "male":
        q.gender = "M"
    if q.gender == "female":
        q.gender = "K"
    if q.gender == "other":
        q.gender = "O"

    return q


# # g = f.patients.join(f.diagnoses)
# # pd.crosstab(g.Code, g.Gender, rownames=["Code"])

class Query:
    def __init__(self):
        self.include_diags = []
        self.exclude_diags = []
        self.include_drugs = []
        self.exclude_drugs = []
        self.gender = None
        self.min_age = None
        self.max_age = None

    def age(self, min=None, max=None):
        self.min_age = min
        self.max_age = max
        return self

    def sex(self, gender):
        self.gender = gender.capitalize()
        return self

    def include(self, diagnosis=None, drug=None):
        if diagnosis is not None:
            if isinstance(diagnosis, list):
                self.include_diags.extend(diagnosis)
            else:
                self.include_diags.append(diagnosis)
        if drug is not None:
            if isinstance(drug, list):
                self.include_drugs.extend(drug)
            else:
                self.include_drugs.append(drug)
        return self

    def exclude(self, diagnosis=None, drug=None):
        if diagnosis is not None:
            if isinstance(diagnosis, list):
                self.exclude_diags.extend(diagnosis)
            else:
                self.exclude_diags.append(diagnosis)
        if drug is not None:
            if isinstance(drug, list):
                self.exclude_drugs.extend(drug)
            else:
                self.exclude_drugs.append(drug)
        return self

    def __eq__(self, other):
        return self.min_age == other.min_age and self.max_age == other.max_age and \
               self.include_drugs == other.include_drugs and self.exclude_drugs == other.exclude_drugs and \
               self.include_diags == other.include_diags and self.exclude_diags == other.exclude_diags

    def __repr__(self):
        return str(self)

    def __str__(self):
        return "Query(includes(%s, %s), excludes=(%s, %s), %d < age < %d, gender=%s)" % \
               (str(self.include_drugs), str(self.include_diags), str(self.exclude_drugs), str(self.exclude_diags), \
                self.min_age, self.max_age, self.gender if self.gender else "both")


class ADEFrame:
    def __init__(self, drugs, diagnoses, patients=None):
        self.drugs = drugs
        self.diagnoses = diagnoses
        self.patients = patients
        self._initialize_counts()

    def _initialize_counts(self):
        self.total_no_patients = len(self.patients)
        self.gender_distribution = self.patients.drop("Age", 1).groupby("Gender").count()
        self.drug_distribution = self.drugs.reset_index() \
                                     .drop("Date", 1) \
                                     .groupby(["Code"]) \
                                     .aggregate({'Patient': pd.Series.nunique}) \
                                     .fillna(0).ix[:, 0]

        self.diagnos_distribution = self.diagnoses.reset_index() \
                                        .drop("Date", 1) \
                                        .groupby(["Code"]) \
                                        .aggregate({'Patient': pd.Series.nunique}) \
                                        .fillna(0).ix[:, 0]

        if not self.patients.empty:
            bins = np.linspace(10, 100, 10)
            self.age_distribution = pd.crosstab(pd.cut(self.patients.Age, bins), \
                                                self.patients.Gender, rownames=["Age"])
        else:
            self.age_distribution = pd.DataFrame()

    def query(self, queries):
        if not isinstance(queries, list):
            queries = [queries]

        ids = self.__execute_query(queries)
        if ids:
            drugs = self.drugs.loc[self.__filter(ids, self.drugs.index)]
            diagnoses = self.diagnoses.loc[self.__filter(ids, self.diagnoses.index)]
            patients = self.patients.loc[ids]
            return ADEFrame(drugs, diagnoses, patients)
        else:
            return ADEFrame(self.__empty(), self.__empty(), self.__empty(["Patient", "Age", "Gender"]))

    def split(self, queries, sample=500):
        if not isinstance(queries, list):
            queries = [queries]

        ids = self.__execute_query(queries)
        all_drugs = set(self.drugs.index)
        all_diags = set(self.diagnoses.index)

        drug_no = all_drugs - ids
        diag_no = all_diags - ids
        if sample > 0 and len(drug_no) > sample:
            drug_no = random.sample(drug_no, sample)

        if sample > 0 and len(diag_no) > sample:
            diag_no = random.sample(diag_no, sample)

        drug_no = list(self.__filter(drug_no, all_diags))
        diag_no = list(self.__filter(diag_no, all_drugs))

        yes_frame = ADEFrame(self.drugs.loc[self.__filter(ids, self.drugs.index)], \
                             self.diagnoses.loc[self.__filter(ids, self.diagnoses.index)], \
                             self.patients.loc[ids])

        if drug_no and diag_no:
            no_frame = ADEFrame(self.drugs.loc[drug_no], self.diagnoses.loc[diag_no], self.patients.loc[diag_no])
        else:
            no_frame = ADEFrame(self.__empty(), self.__empty(), self.patients.loc[diag_no])

        return (yes_frame, no_frame)

    def __empty(self, cols=["Code", "Patient", "Date"]):
        return pd.DataFrame(columns=cols)

    def __execute_query(self, queries):
        if not queries:
            return self

        ids = set()
        for query in queries:
            ids = ids.union(self.__apply_query(query, self.drugs, self.diagnoses))

        return ids

    def __filter(self, ids, idx):
        return filter(lambda x: x in idx, ids)

    def __apply_query(self, query, drugs, diagnoses):
        min_age = query.min_age if query.min_age else 0
        max_age = query.max_age if query.max_age else 1000
        gender = query.gender if query.gender else None

        exclude_drugs = query.exclude_drugs
        include_drugs = query.include_drugs
        include_diags = query.include_diags
        exclude_diags = query.exclude_diags

        age = self.patients.Age
        age_selector = (age > min_age) & (age < max_age)
        if gender:
            patientids = self.patients[age_selector & (self.patients.Gender == gender)].index
        else:
            patientids = self.patients[age_selector].index

        patient_idx = set(patientids)

        indrug = patient_idx
        outdrug = set()
        if include_drugs:
            indrug = set(drugs[drugs.Code.isin(include_drugs)].index)
        if exclude_drugs:
            outdrug = set(drugs[drugs.Code.isin(exclude_drugs)].index)

        drug_idx = (indrug - outdrug)

        indiags = drug_idx
        outdiags = set()
        if include_diags:
            indiags = set(diagnoses[diagnoses.Code.isin(include_diags)].index)

        if exclude_diags:
            outdiags = set(diagnoses[diagnoses.Code.isin(exclude_diags)].index)

        diag_idx = indiags - outdiags

        return patient_idx & drug_idx & diag_idx

    def get_dataset(self, sample=500):
        if self.total_no_patients > sample:
            idx = np.random.choice(self.patients.index, sample, replace=False)
            c = pd.concat([self.diagnoses.ix[idx].reset_index().drop("Date", 1),
                           self.drugs.ix[idx].reset_index().drop("Date", 1)])
            j = pd.crosstab(c.Patient, c.Code)
            j["Age"] = self.patients.ix[idx].Age
            return Dataset(j)
        else:
            c = pd.concat([self.diagnoses.reset_index().drop("Date", 1), self.drugs.reset_index().drop("Date", 1)])
            j = pd.crosstab(c.Patient, c.Code)
            j["Age"] = self.patients.Age
            return Dataset(j)


    def __repr__(self):
        return str(self)

    def __str__(self):
        return "Frame(patients: %d, drugs: %d, diagnoses: %d)" % \
               (self.patients.shape[0], self.drug_distribution.sum(), self.diagnos_distribution.sum())


class Dataset:
    """
      Numpy array of rows and columns where columns are drugs and diagnoses and their count for a partiular
      patient (i.e. for a row)
    """

    def __init__(self, values):
        self.values = values

    def columns(self):
        return self.values.columns

    def set_target(self, target):
        self.values['target'] = target

    def merge(self, other):
        return Dataset(pd.concat([self.values, other.values]).fillna(0))

    def to_csv(self, file):
        self.values.to_csv(file, index=False)

    def drop_query(self, queries):
        """
            Remove the columns used in queries TODO: queries
        """
        if not isinstance(queries, list):
            queries = [queries]

        for query in queries:
            if "Age" in self.values.columns and (query.min_age or query.max_age):
                self.values.drop("Age", 1, inplace=True)

            cols = []
            cols.extend(query.include_diags)
            cols.extend(query.exclude_diags)
            cols.extend(query.include_drugs)
            cols.extend(query.exclude_drugs)

            for col in cols:
                if col in self.values.columns:
                    self.values.drop(col, 1, inplace=True)


class CodePairs:
    def __init__(self, code, pairs, frame):
        self.frame = frame
        self.code = code
        self.pairs = pairs

    def __repr__(self):
        return str(self)

    def __str__(self):
        return "CodePairs(%s, %d)" % (self.code, self.pairs.Count.sum())


def pairs(drug_index, drugs, diagnoses, patient_id, b_time, e_time, acc):
    diag_time = b_time

    # swap times
    if e_time < b_time:
        e_time, b_time = b_time, e_time

    if not patient_id in drug_index: return
    try:
        taken = drugs.xs(patient_id)[b_time:e_time]
    except:
        print(patient_id, b_time, e_time)
        return
    seen = set()
    for took_time, drug in taken.dropna().iterrows():
        if abs((took_time - b_time).days) < 1: continue
        if drug["Code"] in seen: continue
        acc[drug["Code"]] += 1
        seen.add(drug["Code"])


def code_pairs(frame, code, delta=timedelta(days=-7), pad=timedelta(days=0)):
    """ count the number of `code`-drug pairs """
    diagnoses = frame.diagnoses.reset_index().set_index(["Patient", "Date"])
    drugs = frame.drugs.reset_index().set_index(["Patient", "Date"])
    selected_diagnosis = diagnoses[diagnoses.Code == code]
    if selected_diagnosis.empty:
        return CodePairs(code, pd.DataFrame(columns=["Code", "Count"]).set_index("Code"))

    patientids = set(selected_diagnosis.index.get_level_values(0))
    print(len(patientids))
    acc = collections.defaultdict(int)

    drug_index = drugs.index.get_level_values(0)

    for patient_id in patientids:
        if not patient_id in drug_index: continue
        selected = selected_diagnosis.xs(patient_id).reset_index();
        if selected.empty: continue
        selected = selected.ix[random.randint(0, len(selected) - 1)]
        code = selected.ix[1]
        b_time = selected.ix[0]
        b_time = b_time + pad
        e_time = b_time + delta
        pairs(drug_index, drugs, diagnoses, patient_id, b_time, e_time, acc)

    lst = list(acc.items())
    print(len(lst))
    if lst:
        return CodePairs(code, pd.DataFrame(lst, columns=["Code", "Count"]).set_index("Code"), frame)
    else:
        return CodePairs(code, pd.DataFrame(columns=["Code", "Count"]).set_index("Code"), frame)


def prr(a, b, c, d):
    """ proportional reporting ratio """
    if a <= 0 or c <= 0: return 0.0
    return (a * (c + d)) / (c * (a + b));


def disproportion(frame, a, x_count, y_count, method=prr):
    """ return the disproportionatness of a w.r.t x_count and y_count """
    b = x_count - a;
    c = y_count - a;
    d = frame.total_no_patients - a - b - c;
    return method(float(a), float(b), float(c), float(d))


def disproportionality(frame, code_pairs, method=prr, min_a=5):
    """ get the disproporionality of `code` w.r.t. to every drug in pair"""
    code = code_pairs.code
    pairs = code_pairs.pairs

    value = {};
    a_value = {};
    x_count = frame.diagnos_distribution[code]
    for drug, count in pairs.iterrows():
        y_count = frame.drug_distribution[drug]
        a = count[0]
        if a <= min_a: continue
        value[drug] = disproportion(frame, a, x_count, y_count, method=method)
        a_value[drug] = a  # add `a` to the dataframe
    value_table = pd.DataFrame(list(map(lambda v: (v[0], v[1], a_value[v[0]]), value.items())),
                               columns=["Code", "Value", "Count"]).set_index("Code")
    return value_table


def time_serie(frame, code, delta=10, days=1, normalize=None):
    def serie_calculator(i):
        return code_pairs(frame, code, delta=timedelta(days=-days), pad=timedelta(days=i))

    return calculate_time_series(serie_calculator, delta=delta, step_size=days, normalize=normalize)


def calculate_time_series(pair_counter, delta=10, normalize=None, step_size=1):
    start = -delta;
    end = delta;
    time_table = []
    print("Calculating time series")
    for i in range(start, end + 1, step_size):
        # print("Day: %i" % i, timedelta(days=int(-step_size)), timedelta(days=int(i)))
        if i == 0: continue
        current = pair_counter(i).pairs
        current.rename(columns={'Count': "Day %i" % i}, inplace=True)
        if not normalize is None:
            current = current / float(normalize)
        time_table.append(current)

    first = time_table[0]
    return first.join(time_table[1:], how="outer").fillna(0)


def plot_time_series(drug_table, target):
    """ Plot a series of drug found within `target`. In general, `target`
    is expected to be a time serie  """
    names = [];
    i = 0
    for drug, value in drug_table.iteritems():
        if not drug in target.index: continue
        target.xs(drug).plot(color=cm.jet(i / 10., 1))
        i += 1
        names.append(drug)
    # plt.legend(names, loc="upper left", bbox_to_anchor=(1, 1))
    # plt.ylabel("Percent patients")
    # plt.xlabel("Delta")

    return names


if __name__ == "__main__":
    import collections, json

    query = collections.defaultdict(list)
    query["exclude_drugs"] = []
    query["include_drugs"] = ["N02BE01"]
    query["exclude_diags"] = ["Z510"]

    # query2 = collections.defaultdict(list)
    # query2["include_drugs"] = ["B05XA06"]

    f = ADEFrame(*load_dataset())

    print(f.patients)

    # print(set(f.diagnoses.index.levels[0]))
    r = f.query([query])
    print(f.drug_counts)
    print(r.drug_counts)
    print(r.drugs)
    print(r.diagnoses)
    print(r.age_distribution)

    (l, r) = f.split([query])
    print(l.drug_counts)
    print("==================")
    print(r.drug_counts)


#drugs.loc[(list(indrug-outdrug),),:]


