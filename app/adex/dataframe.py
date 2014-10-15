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

# # g = f.patients.join(f.diagnoses)
# # pd.crosstab(g.Code, g.Gender, rownames=["Code"])


class ADEFrame:
    def __init__(self, drugs, diagnoses, patients=None):
        self.patients = patients
        self.drugs = drugs
        self.diagnoses = diagnoses
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
            bins = np.linspace(0, 100, 11)
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

        ids = set(self.__execute_query(queries))
        all_drugs = set(self.drugs.index)
        all_diags = set(self.diagnoses.index)
        all_patients = set(self.patients.index)

        drug_no = all_drugs - ids
        diag_no = all_diags - ids
        patients_no = all_patients - ids

        # if 0 < sample < len(drug_no):
        #     drug_no = random.sample(drug_no, sample)
        #
        # if 0 < sample < len(diag_no):
        #     diag_no = random.sample(diag_no, sample)

        # drug_no = set(self.__filter(drug_no, all_diags))
        # diag_no = set(self.__filter(diag_no, all_drugs))
        # patients_no = set(self.__filter())

        yes_frame = ADEFrame(self.drugs.loc[self.__filter(ids-drug_no, self.drugs.index)],
                             self.diagnoses.loc[self.__filter(ids-diag_no, self.diagnoses.index)],
                             self.patients.loc[ids - patients_no])

        if drug_no and diag_no:
            no_frame = ADEFrame(self.drugs.loc[drug_no],
                                self.diagnoses.loc[diag_no],
                                self.patients.loc[patients_no])
        else:
            no_frame = ADEFrame(self.__empty(), self.__empty(), self.patients.loc[diag_no])

        return yes_frame, no_frame

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

            idx = random.sample(self.patients.index, sample)
            print idx
            # idx = np.random.choice(self.patients.index, sample, replace=False)
            c = pd.concat([self.diagnoses.ix[idx].reset_index().drop("Date", 1), self.drugs.ix[idx].reset_index().drop("Date", 1)])
            j = pd.crosstab(c.index, c.Code)
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





def time_serie(frame, code, delta=10, days=1, normalize=None):
    def serie_calculator(i):
        return code_pairs(frame, code, delta=timedelta(days=-days), pad=timedelta(days=i))

    return calculate_time_series(serie_calculator, delta=delta, step_size=days, normalize=normalize)


def calculate_time_series(pair_counter, delta=10, normalize=None, step_size=1):
    start = -delta
    end = delta
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
    pass
    # names = [];
    # i = 0
    # for drug, value in drug_table.iteritems():
    #     if not drug in target.index: continue
    #     target.xs(drug).plot(color=cm.jet(i / 10., 1))
    #     i += 1
    #     names.append(drug)
    # plt.legend(names, loc="upper left", bbox_to_anchor=(1, 1))
    # plt.ylabel("Percent patients")
    # plt.xlabel("Delta")

    # return names


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


