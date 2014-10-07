__author__ = 'isak'
from sklearn.ensemble import RandomForestClassifier

def fit(x, y, feature_names=None, target_names=None):
    clf = RandomForestClassifier(n_estimators=50, n_jobs=4)
    clf.fit(x, y)

    return [{'importance': x, 'name': y} for x, y in sorted(zip(clf.feature_importances_, feature_names),
                                                            cmp=lambda (v1, k1), (v2, k2):  cmp(v1, v2),
                                                            reverse=True)]



if __name__ == "__main__":
    from sklearn.datasets import load_iris

    iris = load_iris()
    import json


    print json.dumps(fit(iris.data, iris.target, feature_names=iris.feature_names, target_names=iris.target_names))