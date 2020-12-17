import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import Container from "@material-ui/core/Container";

export default function Home() {
  return (
    <Layout home>
      <Head>
  <title>{siteTitle}</title>
      </Head>
      <Container>
      
        <p>
          hogehoge
        </p>
      </Container>
      
      
    </Layout>
  )
}