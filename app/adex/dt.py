__author__ = 'isak'

from sklearn import tree

def fit(X, y):

    decision_tree = tree.DecisionTreeClassifier(max_depth=10)
    decision_tree.fit(X.values, y.values)
    tree.export_graphviz

    pass