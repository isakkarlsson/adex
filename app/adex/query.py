import collections


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
