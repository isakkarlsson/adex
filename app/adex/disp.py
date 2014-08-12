__author__ = 'isak'
import collections, random
from datetime import timedelta

import pandas as pd

def prr(a, b, c, d):
    """ proportional reporting ratio """
    if a <= 0 or c <= 0: return 0.0
    return (a * (c + d)) / (c * (a + b))

class CodePairs:
    def __init__(self, code, pairs, frame):
        self.frame = frame
        self.code = code
        self.pairs = pairs

    def disproportionality(self, method=prr, min_a=5):
        """ get the disproporionality of `code` w.r.t. to every drug in pair"""
        code = self.code
        pairs = self.pairs
        frame = self.frame
        if pairs.empty:
            return pd.DataFrame(columns=["Code", "Value", "Count"])

        value = {}
        a_value = {}
        x_count = frame.diagnos_distribution[code]
        for drug, count in pairs.iterrows():
            y_count = frame.drug_distribution[drug]
            a = count[0]
            if a <= min_a: continue
            value[drug] = disproportion(frame, a, x_count, y_count, method=method)
            a_value[drug] = a  # add `a` to the dataframe

        if len(value) < 1:
            return pd.DataFrame(columns=["Code", "Value", "Count"])

        value_table = pd.DataFrame(list(map(lambda v: (v[0], v[1], a_value[v[0]]), value.items())),
                                   columns=["Code", "Value", "Count"]).set_index("Code")
        return value_table.sort("Value")

    def __repr__(self):
        return str(self)

    def __str__(self):
        return "CodePairs(%s, %d)" % (self.code, self.pairs.Count.sum())


def pairs(drug_index, drugs, diagnoses, patient_id, b_time, e_time, acc):
    # swap times
    if e_time < b_time:
        e_time, b_time = b_time, e_time

    if not patient_id in drug_index:
        return

    try:
        taken = drugs.xs(patient_id)[b_time:e_time]
    except:
        return
    seen = set()
    for took_time, drug in taken.dropna().iterrows():
        if abs((took_time - b_time).days) < 1:
            continue
        if drug["Code"] in seen:
            continue

        acc[drug["Code"]] += 1
        seen.add(drug["Code"])


def code_pairs(frame, code, delta=timedelta(days=-7), pad=timedelta(days=0)):
    """ count the number of `code`-drug pairs """
    diagnoses = frame.diagnoses.reset_index().set_index(["Patient", "Date"])
    drugs = frame.drugs.reset_index().set_index(["Patient", "Date"])
    selected_diagnosis = diagnoses[diagnoses.Code == code]
    if selected_diagnosis.empty:
        return CodePairs(code, pd.DataFrame(columns=["Code", "Count"]).set_index("Code"), frame)

    patientids = set(selected_diagnosis.index.get_level_values(0))
    print(len(patientids))
    acc = collections.defaultdict(int)

    drug_index = drugs.index.get_level_values(0)

    for patient_id in patientids:
        if not patient_id in drug_index: continue
        selected = selected_diagnosis.xs(patient_id).reset_index()
        if selected.empty: continue
        selected = selected.ix[random.randint(0, len(selected) - 1)]
        # code = selected.ix[1]
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





def disproportion(frame, a, x_count, y_count, method=prr):
    """ return the disproportionatness of a w.r.t x_count and y_count """
    b = x_count - a
    c = y_count - a
    d = frame.total_no_patients - a - b - c
    return method(float(a), float(b), float(c), float(d))


# In [5]: pairs = code_pairs(frame, "Z510")
# In [10]: disproportionality(frame, pairs).sort("Value", ascending=False)
