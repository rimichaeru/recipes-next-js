import { useState } from "react";
// import { useRouter } from "next/router";
import {
  sanityClient,
  urlFor,
  usePreviewSubscription,
  PortableText,
} from "../../lib/sanity";
import styles from "../../styles/Recipe.module.scss";

// the $slug matches to the getStaticProps slug below
const recipeQuery = `*[_type == "recipe" && slug.current == $slug][0] {
  _id, 
  name, 
  slug, 
  mainImage,
  ingredient[] {
    _key,
    unit, 
    wholeNumber, 
    fraction, 
    ingredient -> {
      name
    }
  },
  instructions,
  likes
}`;

export default function OneRecipe({ data = {}, preview }) {
  // const router = useRouter();

  if (!data) return <div>Loading...</div>;

  // const { data: recipe } = usePreviewSubscription(recipeQuery, {
  //   params: { slug: data.recipe?.slug.current },
  //   initialData: data,
  //   enabled: preview,
  // });

  // if (router.isFallback) {
  //   return <div>Loading...</div>;
  // }

  const [likes, setLikes] = useState(data?.recipe?.likes);
  // const [likes, setLikes] = useState(data?.recipe?.likes);

  const addLike = async () => {
    const res = await fetch("/api/handle-like", {
      method: "POST",
      body: JSON.stringify({ _id: recipe._id }),
    }).catch((error) => console.log(error));

    const data = await res.json();

    setLikes(data.likes);
  };

  const { recipe } = data; // use if not using preview above

  return (
    <article className={styles.recipe}>
      <h1>{recipe.name}</h1>
      <button className={styles.likeButton} onClick={addLike}>
        {likes} ❤
      </button>

      <main className={styles.content}>
        <img src={urlFor(recipe?.mainImage).url()} alt={recipe.name} />
        <div className={styles.breakdown}>
          <ul className={styles.ingredients}>
            {recipe.ingredient?.map((ingredient) => {
              return (
                <li key={ingredient._key} className={styles.ingredient}>
                  {ingredient?.wholeNumber}
                  {ingredient?.fraction} {ingredient?.unit}
                  <br />
                  {ingredient?.ingredient?.name}
                </li>
              );
            })}
          </ul>
          <PortableText
            blocks={recipe?.instructions}
            className={styles.instructions}
          />
        </div>
      </main>
    </article>
  );
}

// gets a list of what the paths could be, before render
export async function getStaticPaths() {
  const paths = await sanityClient.fetch(
    `*[_type == "recipe" && defined(slug.current)] {
      "params": {
        "slug": slug.current
      }
    }`
  );

  return {
    paths,
    fallback: false, // fallback stops 404, goes back to page
  };
}

export async function getStaticProps({ params }) {
  const { slug } = params; // slug here matches name of this route file [slug].js
  const recipe = await sanityClient.fetch(recipeQuery, { slug });

  return { props: { data: { recipe }, preview: false } };
}
