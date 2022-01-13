import {useRouter} from "next/router";
import {
  getClient,
  usePreviewSubscription
} from "@lib/sanity";
import {format} from 'date-fns';
import {groq} from "next-sanity";

// стартовый экран
export default function Post(props) {
  const {post_data, preview} = props;

  const router = useRouter();

  const {data: posts} = usePreviewSubscription(query, {
    initialData: post_data,
    enabled: preview || router.query.preview !== undefined,
  });

  const getContentBody = (array) => Array.isArray(array) ? array.map(el => el.text) : null;

  return (
    <>
      {posts &&
        posts.map((post, idx) => (
          <article className="p-5" key={idx}>
            <div className=" w-full lg:max-w-full lg:flex text-center">
              <div className=" w-full border border-gray-400 p-5 flex flex-col justify-between leading-normal">
                <div className="mb-8">
                  <div className="text-gray-900 font-bold text-xl mb-2">{post.title}</div>
                  <p className="text-gray-700 text-base">
                    {post.body.map((el, key) => (
                      <div key={key}>{getContentBody(el.children)}</div>
                    ))}
                  </p>
                </div>
                {post.mainImage?.asset?.url && (
                  <div className="block h-64 relative rounded leading-snug">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="w-full h-full rounded-r object-contain"
                      src={post.mainImage.asset.url}
                      alt="image"
                    />
                  </div>
                )}

                <div className="w-full text-right">
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
        title,
        publishedAt,
        mainImage{
        asset->{
          _id,
          width,
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
