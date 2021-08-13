import Head from "next/head";
import Link from "next/link";
import { sanityClient, urlFor } from "../lib/sanity";
import styles from "../styles/Home.module.scss";

const recipesQuery = `*[_type == "recipe"] {
  _id,
  name,
  slug,
  mainImage
}`;

export default function Home({ recipes }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Best Kitchen</title>
        <meta
          name="description"
          content="The Best Kitchen for Your Recipe Needs!"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1>Welcome to the Best Kitchen</h1>

      <ul className="recipes-list">
        {recipes?.length > 0 &&
          recipes.map((recipe) => {
            return (
              <li key={recipe._id} className="recipe-card">
                <Link href={`/recipes/${recipe.slug.current}`}>
                  <a>
                    <img src={urlFor(recipe.mainImage).url()} alt={recipe.name} />
                    <span>{recipe.name}</span>
                  </a>
                </Link>
              </li>
            );
          })}
      </ul>
    </div>
  );
}

export async function getStaticProps() {
  const recipes = await sanityClient.fetch(recipesQuery);
  return { props: { recipes } };
}
