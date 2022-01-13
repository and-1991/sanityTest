import {useRouter} from "next/router";
import {
  getClient,
  usePreviewSubscription
} from "@lib/sanity";
import {format} from 'date-fns'

import {groq} from "next-sanity";

// стартовый экран
export default function Post(props) {
  const {post_data, preview} = props;

  const router = useRouter();

  const {data: posts} = usePreviewSubscription(query, {
    initialData: post_data,
    enabled: preview || router.query.preview !== undefined,
  });

  return (
    <>
      {posts &&
        posts.map((post, idx) => (
          <article className="p-5" key={idx}>
            <div className=" w-full lg:max-w-full lg:flex">
              <div className=" w-full border border-gray-400 p-5 flex flex-col justify-between leading-normal">
                <div className="mb-8">
                  <div className="text-gray-900 font-bold text-xl mb-2">{post.excerpt}</div>
                  <p className="text-gray-700 text-base">
                    {post.body[0].children[0].text}
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="text-sm">
                    <p className="text-gray-900 leading-none">{post.author.name}</p>
                    <p className="text-gray-600">{format(new Date(post.publishedAt), 'dd/MM/yyyy')}</p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
    </>
  );
}


//принцип graphGL-ных запросов (определяем только то, что нужно нам)
const query = groq`*[_type == "post"] | order(_createdAt desc) {
        author->{
          name
        },
        body,
        excerpt,
        publishedAt,
        mainImage{
        asset->{
          _id,
          url
          }
        }
      }`;

// необходимо для функционирования next.js
export async function getStaticProps({params, preview = false}) {
  const post = await getClient(preview).fetch(query);

  return {
    props: {
      post_data: post,
      preview,
    },
    revalidate: 10,
  };
}
