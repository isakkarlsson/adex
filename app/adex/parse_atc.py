__author__ = 'isak'

def parse(data):
    m = {}
    for line in data:
        print line
        s = line.split(",,")
        if len(s[0].strip()) > 4:
            print s
            m[s[0].strip()] = s[1].strip()

    return m

if __name__ == "__main__":
    import json
    data = open("atc.csv")
    m = parse(data)
    data = json.dumps(m)
    out = open("atc.js", "w")
    out.write(data)
