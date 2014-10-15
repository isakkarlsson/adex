# -*- coding: utf-8 -*-
__author__ = 'isak'

import re


def parse(data):
    m = {}
    pattern = re.compile(r'\s{2,}')
    for line in data:
        print line
        s = re.split(pattern, line)
        m[s[0].strip()] = s[1].strip()

    return m

if __name__ == "__main__":
    import json
    data = open("KSH97_KOD.txt")
    m = parse(data)
    data = json.dumps(m)
    out = open("icd10.js", "w")
    out.write(data)
