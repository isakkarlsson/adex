__author__ = 'isak'

from sklearn import tree
import sklearn.tree._tree as _tree
import numpy as np


def fit(x, y, feature_names=None, target_names=None):
    def node_to_str(tree, node_id):
        value = tree.value[node_id]
        if tree.n_outputs == 1:
            value = value[0, :]

        if tree.children_left[node_id] == _tree.TREE_LEAF:
            if target_names is not None:
                value = target_names[np.argmax(value)]

            return "value = %s" % value
        else:
            if feature_names is not None:
                feature = feature_names[tree.feature[node_id]]
            else:
                feature = "X[%s]" % tree.feature[node_id]

            return "%s <= %.4f" % (feature, tree.threshold[node_id])

    def recurse(tree, node_id, parent=None):
        if node_id == _tree.TREE_LEAF:
            raise ValueError("Invalid node_id %s" % t.TREE_LEAF)

        acc = {}

        if parent is not None:
            acc["parent"] = parent

        left_child = tree.children_left[node_id]
        right_child = tree.children_right[node_id]

        acc["name"] = node_to_str(tree, node_id)
        if left_child != _tree.TREE_LEAF:
            children = []
            children.append(recurse(tree, left_child, parent=acc["name"]))
            children.append(recurse(tree, right_child, parent=acc["name"]))
            acc["children"] = children

        return acc

    decision_tree = tree.DecisionTreeClassifier(max_depth=10)
    decision_tree.fit(x, y)
    t = decision_tree.tree_
    print t.children_left
    print t.children_right

    return recurse(decision_tree.tree_, 0)


if __name__ == "__main__":
    from sklearn.datasets import load_iris

    iris = load_iris()
    import json
    print json.dumps(fit(iris.data, iris.target, iris.feature_names, iris.target_names), indent=4)
