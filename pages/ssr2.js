import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import MaterialTable from "material-table";
import { makeStyles } from "@material-ui/core/styles";
import Link from "next/link";
import classNames from "classnames";
import { HorizontalBar } from "react-chartjs-2";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import Router from 'next/router'

const useStyles = makeStyles((theme) => ({
  stylePersons: {
    marginTop: 50,
  },
  styleLabel: {
    color: "#cf3a2a",
  },
  link: {
    textDecoration: "none",
  },
  graphDiv: {
    marginTop: 50,
  },
  formControl: {
    margin: theme.spacing(2),
    minWidth: 120,
  }
}));

export default function Post({ postData, to, toUris, g }) {
  const classes = useStyles();

  const children = {};

  for (let i = 0; i < postData.length; i++) {
    const obj = postData[i];
    const from = obj.from.value;
    //const to = obj.to.value;
    const transfer = obj.transfer.value;
    const commodity = obj.commodity ? obj.commodity.value : "None";

    if (!children[to]) {
      children[to] = {};
    }

    if (!children[to][commodity]) {
      children[to][commodity] = {};
    }

    if (!children[to][commodity][from]) {
      children[to][commodity][from] = 0;
    }
    children[to][commodity][from] += 1;
  }

  let obj = children[to];

  const graphs = [];

  const data2 = []
  const labels2 = []

  let max = -1

  for (let label in obj) {
    const labels = [];
    const data = [];

    const obj2 = obj[label];
    let arr = Object.keys(obj2).map((e) => ({ key: e, value: obj2[e] }));

    arr.sort(function (a, b) {
      if (a.value < b.value) return 1;
      if (a.value > b.value) return -1;
      return 0;
    });

    arr.map((e) => {
      labels2.push(label+" - "+e.key.split("#")[1]+"（"+e.value.toLocaleString()+"）");
      data2.push(e.value);
      
      max = e.value > max ? e.value : max
    });

    // break
  }

  for (let label in obj) {
    const labels = [];
    const data = [];

    const obj2 = obj[label];
    let arr = Object.keys(obj2).map((e) => ({ key: e, value: obj2[e] }));

    arr.sort(function (a, b) {
      if (a.value < b.value) return 1;
      if (a.value > b.value) return -1;
      return 0;
    });

    arr.map((e) => {
      labels.push(e.key.split("#")[1]);
      data.push(e.value);
    });

    graphs.push({
      labels: labels2,
      datasets: [
        // 表示するデータセット
        {
          data: data2,
          label: "# of Transfer",
        }
      ],
      label,
    });

    break
  }

  /** グラフオプション */
  const graphOption = {
    scales: {
      xAxes: [
        // x軸設定
        {
          ticks: {
            // 軸ラベル設定
            min: 0,
            max,
            stepSize: 1,
          },
        },
      ],
    },
  };

  function onChange(e) {
    const tmp = e.target.value.split(",");
    Router.push("?g=" + encodeURIComponent(tmp[0]) + "&to=" + encodeURIComponent(tmp[1])
    )
  }

  //------------

  var states = [];
  toUris.map((toUri) => {
    states.push({
      name: toUri.split("#")[1], // + "（" + Object.keys(children[toUri]).length + "）",
      code: toUri,
    });
  })

  var options = states.map((n) => (
    <option key={n.code} value={g + "," + n.code}>
      {n.name}
    </option>
  ));

  //------------

  var states2 = [
    {
      name: "http://example.org/depcha.stagville.1",
      code: "http://example.org/depcha.stagville.1",
    },
    {
      name: "http://example.org/depcha.wheaton.1",
      code: "http://example.org/depcha.wheaton.1",
    },
    {
      name: "http://example.org/depcha.schlitz.1",
      code: "http://example.org/depcha.schlitz.1",
    },
    {
      name: "http://example.org/depcha.ward_ledger.1",
      code: "http://example.org/depcha.ward_ledger.1",
    },
  ];

  var options2 = states2.map((n) => (
    <option key={n.code} value={n.code + "," + to}>
      {n.name}
    </option>
  ));

  //------------

  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <Container>
        <div>
          <FormControl className={classes.formControl}>
            <InputLabel>Graph URI</InputLabel>
            <Select native value={g + "," + to} onChange={onChange}>
              {options2}
            </Select>
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel>To</InputLabel>
            <Select native value={g + "," + to} onChange={onChange}>
              {options}
            </Select>
          </FormControl>
        </div>

        {graphs.map((graphData) => {
          return (
            <div key={graphData.label} className={classes.stylePersons}>
              <HorizontalBar data={graphData} options={graphOption} height={Math.max(graphData.labels.length * 5, 50)}/>
            </div>
          );
        })}
      </Container>
    </Layout>
  );
}

export async function getServerSideProps2(context) {
  const url = "http://localhost:3000/test.json";
  const res = await fetch(url);
  let postData = await res.json();
  if (postData.results) {
    postData = postData.results.bindings;
  }
  return {
    props: {
      postData,
      to : "https://gams.uni-graz.at/o:depcha.ward_ledger.1#ThosWardLtd",
      toUris : ["https://gams.uni-graz.at/o:depcha.ward_ledger.1#ThosWardLtd"],
      g : "http://example.org/depcha.ward_ledger.1"
    },
  };
}

export async function getServerSideProps(context) {
  const params = context.query;

  const g = params.g
    ? decodeURIComponent(params.g)
    : "http://example.org/depcha.ward_ledger.1";
  let to = decodeURIComponent(params.to) || "null";

  const query2 =
    `
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX gams: <https://gams.uni-graz.at/o:gams-ontology#>
    PREFIX gn: <http://www.geonames.org/ontology#>
    PREFIX functx: <http://www.functx.com>
    PREFIX bk: <https://gams.uni-graz.at/o:depcha.bookkeeping#>
    PREFIX t: <http://www.tei-c.org/ns/1.0>
            
    SELECT DISTINCT ?to
    FROM <` +
    g +
    `>
    WHERE {
      ?transfer bk:to ?to.
    }
    ORDER BY ?transfer
    `;

  const url2 =
    "https://dydra.com/naoki_cocaze/depcha-analysis/sparql?output=json&query=" +
    encodeURIComponent(query2);

  const res2 = await fetch(url2);
  let toList = await res2.json();
  if (toList.results) {
    toList = toList.results.bindings;
  }

  const toUris = []
  toList.map((obj) => {
    const uri = obj.to.value
    toUris.push(uri)
  })

  if(!toUris.includes(to)){
    to = toUris[0]
  }

  const query =
    `
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX gams: <https://gams.uni-graz.at/o:gams-ontology#>
    PREFIX gn: <http://www.geonames.org/ontology#>
    PREFIX functx: <http://www.functx.com>
    PREFIX bk: <https://gams.uni-graz.at/o:depcha.bookkeeping#>
    PREFIX t: <http://www.tei-c.org/ns/1.0>
            
    SELECT DISTINCT *
    FROM <` +
    g +
    `>
    WHERE {
      ?transaction rdf:type bk:Transaction;
                            bk:consistsOf ?transfer.
      
      ?transfer bk:from ?from;
                          bk:to <` + to + `>;
                          bk:transfers ?measure.
      
      OPTIONAL{?measure bk:commodity ?commodity}.
    }
    ORDER BY ?transfer
    `;

  const url =
    "https://dydra.com/naoki_cocaze/depcha-analysis/sparql?output=json&query=" +
    encodeURIComponent(query);

  const res = await fetch(url);
  let postData = await res.json();
  if (postData.results) {
    postData = postData.results.bindings;
  }

  return {
    props: {
      postData,
      to,
      toUris,
      g,
    },
  };
}
