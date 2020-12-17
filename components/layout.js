import Head from 'next/head'
import styles from './layout.module.css'
import utilStyles from '../styles/utils.module.css'
import { makeStyles } from "@material-ui/core/styles";
import Link from 'next/link'

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

export const siteTitle = "Next.js Sample Website"

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  link: {
    textDecoration: "none",
    color: "white",
  },
}));

export default function Layout({ children, home }) {
  return <div className={useStyles.root}>
    <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
        <meta
          name="description"
          content="Learn how to build a personal website using Next.js"
        />
        <meta
          property="og:image"
          content={`https://og-image.now.sh/${encodeURI(
            siteTitle
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <AppBar position="static">
        <Toolbar>
          <Typography className={styles.title} edge="start" variant="h6">
            depcha analysis
          </Typography>
          <Button color="inherit">
            <Link href="/">
            <a className={styles.link} >
              Home
              </a>
            </Link>
          </Button>
          <Button color="inherit">
            <Link href="/about">
            <a className={styles.link} >
              About
              </a>
            </Link>
          </Button>
          <Button color="inherit">
            <Link href="/posts/ssr">
              <a className={styles.link} >
              Example 01
              </a>
            </Link>
          </Button>
          <Button color="inherit">
            <a href="/snorql" className={styles.link}>
              Snorql
            </a>
          </Button>
        </Toolbar>
      </AppBar>

      <main>{children}</main>
      {!home && (
        <div className={styles.backToHome}>
          <Link href="/">
            <a>← Back to home</a>
          </Link>
        </div>
        )}
        </div>
}