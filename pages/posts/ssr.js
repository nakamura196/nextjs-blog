import Layout from "../../components/layout";
import Head from "next/head";
import utilStyles from "../../styles/utils.module.css";
import { useRouter } from "next/router";

export default function Post({ postData }) {
  const router = useRouter();
  console.log(router.query);
  console.log(postData);
  return (
    <Layout>
      {/* Add this <Head> tag */}
      <Head>
        <title>{postData.length}</title>
      </Head>

      <article>
        <ul className={utilStyles.list}>
          {postData.map(({ entry, entryUri }) => (
            <li className={utilStyles.listItem} key={entryUri}>
              {entry}
            </li>
          ))}
        </ul>
      </article>
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
