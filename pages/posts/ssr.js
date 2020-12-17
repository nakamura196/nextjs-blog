import Layout from '../../components/layout'
import Head from 'next/head'
import utilStyles from '../../styles/utils.module.css'

export default function Post({ postData }) {
  return <Layout>

      {/* Add this <Head> tag */}
      <Head>
        <title>{postData.text}</title>
      </Head>
    
      <article>
        <h1 className={utilStyles.headingXl}>{postData.text}</h1>
        
      </article></Layout>
}

export async function getServerSideProps() {
    const res = await fetch(`https://nextjs-blog-343rvtfkw.vercel.app/api/hello`)
    const postData = await res.json()
    return {
        props: {
        postData
        }
    }
}