import Layout from "../../components/layout";
import Head from "next/head";
import { useRouter } from "next/router";
import Container from "@material-ui/core/Container";
import MaterialTable from "material-table";
import { makeStyles } from "@material-ui/core/styles";
import Link from "next/link";

const useStyles = makeStyles((theme) => ({
  table: {
    marginTop: 20,
  },
}));

export default function Post({ postData }) {
  const router = useRouter();
  console.log(router.query);
  console.log(postData);

  const classes = useStyles();

  const columns = [
    {
      title: "ENTRY",
      field: "entry",
      render: (row) => {
        return (
          <Link href={`?entry=${encodeURIComponent(row.entryUri)}`}>
            <a>{row.entry}</a>
          </Link>
        );
      },
    },
    { title: "WHEN", field: "when" },
    {
      title: "FROM",
      field: "from",
      render: (row) => {
        return (
          <Link href={`?from=${encodeURIComponent(row.fromUri)}`}>
            <a>{row.from}</a>
          </Link>
        );
      },
    },
    {
      title: "TO",
      field: "to",
      render: (row) => {
        return (
          <Link href={`?to=${encodeURIComponent(row.toUri)}`}>
            <a>{row.to}</a>
          </Link>
        );
      },
    },
    { title: "MEASURABLE", field: "measurable" },
  ];

  return (
    <Layout>
      <Container>
        <div className={classes.table}>
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
        </div>
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
    LIMIT 100
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
  }
  postData = rows;
  return {
    props: {
      postData,
    },
  };
}
