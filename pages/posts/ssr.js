import Layout from "../../components/layout";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import MaterialTable from "material-table";
import { makeStyles } from "@material-ui/core/styles";
import Link from "next/link";
import classNames from "classnames";
import { Pie } from 'react-chartjs-2';

const useStyles = makeStyles((theme) => ({
  stylePersons: {
    color: "#cf3a2a",
    marginTop: 50,
  },
  link: {
    textDecoration: "none",
  },
  margin: {
    margin: theme.spacing(1),
  },
}));

export default function Post({ postData, persons, commodities }) {
  const classes = useStyles();

  const columns = [
    {
      title: "ENTRY",
      field: "entry",
      render: (row) => {
        return (
          <div>
            {/*
            <Link href={`?entry=${encodeURIComponent(row.entryUri)}`}>
              <a>{row.entry}</a>
            </Link>{" "}
            */}
            {row.entry}
            <a
              className={classNames(classes.link)}
              href={`https://nakamura196.github.io/depcha/snorql/?describe=${encodeURIComponent(
                row.entryUri
              )}`}
              target="_blank"
            >
              <Button
                className={classes.margin}
                size="small"
                variant="contained"
                color="primary"
              >
                RDF
              </Button>
            </a>
          </div>
        );
      },
    },
    { title: "WHEN", field: "when" },
    {
      title: "FROM",
      field: "from",
      render: (row) => {
        return (
          <div>
            <Link href={`?from=${encodeURIComponent(row.fromUri)}`}>
              <a>{row.from}</a>
            </Link>{" "}
            <a
              className={classNames(classes.link)}
              href={`https://nakamura196.github.io/depcha/snorql/?describe=${encodeURIComponent(
                row.fromUri
              )}`}
              target="_blank"
            >
              <Button
                className={classes.margin}
                size="small"
                variant="contained"
                color="primary"
              >
                RDF
              </Button>
            </a>
          </div>
        );
      },
    },
    {
      title: "TO",
      field: "to",
      render: (row) => {
        return (
          <div>
            <Link href={`?to=${encodeURIComponent(row.toUri)}`}>
              <a>{row.to}</a>
            </Link>{" "}
            <a
              className={classNames(classes.link)}
              href={`https://nakamura196.github.io/depcha/snorql/?describe=${encodeURIComponent(
                row.toUri
              )}`}
              target="_blank"
            >
              <Button
                className={classes.margin}
                size="small"
                variant="contained"
                color="primary"
              >
                RDF
              </Button>
            </a>
          </div>
        );
      },
    },
    { title: "MEASURABLE", field: "measurable" },
  ];

  let list = [];
  for (let key in persons) {
    list.push(<li key={key}>{persons[key] + "=" + key}</li>);
  }

  //------------

  const labels = []
  const data = []

  let arr = Object.keys(commodities).map((e)=>({ key: e, value: commodities[e] }));
  arr.sort(function(a,b){
    if(a.value < b.value) return 1;
    if(a.value > b.value) return -1;
    return 0;
  });

  let listCommodities = [];
  arr.map((commodity) => (
    listCommodities.push(<li key={commodity.key}>{commodity.key + ": "+commodity.value}</li>),
    labels.push(commodity.key),
    data.push(commodity.value)
  ))

  const graphData= {
    labels,
    datasets: [
      // 表示するデータセット
      {
        data
      },
    ],
  };

  //------------

  return (
    <Layout>
      <Container>
        <MaterialTable
          title=""
          columns={columns}
          data={postData}
          //isLoading={this.state.isLoading}
          options={{
            pageSize: 10,
            pageSizeOptions: [10, 20, 50, 100],
            toolbar: true,
            paging: true,
          }}
        />

        <h3 className={classes.stylePersons}>Commodities</h3>
        <ul>{listCommodities}</ul>

        <Pie data={graphData} />

        <h3 className={classes.stylePersons}>Persons</h3>
        <ul>{list}</ul>
      </Container>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const params = context.query;

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
            
    SELECT DISTINCT ?ENTRY ?ENTRY_URI ?WHEN ?FROM ?FROM_URI ?TO ?TO_URI ?MEASURABLE 
    FROM <http://example.org/ward_ledger.1>
    WHERE {
        ?ENTRY_URI bk:when ?WHEN; bk:entry ?ENTRY; bk:consistsOf ?transfer . 
        ` +
    (params.entry ? `filter (?ENTRY_URI = <${params.entry}>)` : "") +
    `
      ?transfer bk:from ?FROM_URI . ?FROM_URI bk:name ?FROM .
      ` +
    (params.from ? `filter (?FROM_URI = <${params.from}>)` : "") +
    `
      ?transfer bk:to ?TO_URI . ?TO_URI bk:name ?TO .
      ` +
    (params.to ? `filter (?TO_URI = <${params.to}>)` : "") +
    `
      ?transfer bk:transfers/bk:commodity ?MEASURABLE  .
    }
    ORDER BY ?WHEN
    `;

  const url =
    "https://dydra.com/ut-digital-archives/kokaze/sparql?output=json&query=" +
    encodeURIComponent(query);

  const res = await fetch(url);
  let postData = await res.json();
  if (postData.results) {
    postData = postData.results.bindings;
  }

  const arr = postData;
  const rows = [];

  const persons = {};
  const commodities = {};

  for (const item of arr) {
    rows.push({
      entry: item.ENTRY.value,
      entryUri: item.ENTRY_URI.value,
      when: item.WHEN.value,
      from: item.FROM.value,
      fromUri: item.FROM_URI.value,
      to: item.TO.value,
      toUri: item.TO_URI.value,
      measurable: item.MEASURABLE.value,
    });

    if (!commodities[item.MEASURABLE.value]) {
      commodities[item.MEASURABLE.value] = 0;
    }
    commodities[item.MEASURABLE.value] += 1;

    if (!persons[item.TO_URI.value]) {
      persons[item.TO_URI.value] = item.TO.value;
    }

    if (!persons[item.FROM_URI.value]) {
      persons[item.FROM_URI.value] = item.FROM.value;
    }
  }

  return {
    props: {
      postData: rows,
      persons,
      commodities,
    },
  };
}
