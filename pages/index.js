import {useRouter} from "next/router";
import {
  getClient,
  usePreviewSubscription
} from "@lib/sanity";
import {format} from 'date-fns';
import {groq} from "next-sanity";
import {useState} from "react";
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

// стартовый экран
export default function Post(props) {
  const {post_data, preview} = props;

  const router = useRouter();

  const {data: posts} = usePreviewSubscription(query, {
    initialData: post_data,
    enabled: preview || router.query.preview !== undefined,
  });

  const [selectedImg, setSelectedImg] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(undefined);

  const openDialog = url => {
    setSelectedImg(url);
    setIsOpen(true);
  }

  const closeDialog = () => {
    setIsOpen(false)
    setTimeout(() => {
      setSelectedImg(null)
    }, 200)
  }

  const handleChange = (event) => {
    setSelectedPost(event.target.value);
  };

  const getContentBody = (array) => Array.isArray(array) ? array.map(el => el.text) : null;

  return (
    <>
      <div className="p-5">Selected Post</div>
      <div className="pr-5 pl-5">
        <Select
          autoWidth
          value={selectedPost}
          onChange={handleChange}
        >
          {posts && posts.map((post, idx) => (
            <MenuItem key={idx} value={post.title}>
              {post.title}
            </MenuItem>
          ))}
        </Select>
      </div>
      {posts &&
        posts.map((post, idx) => (
          <article className="p-5" key={idx}>
            <div className="w-full lg:max-w-full lg:flex text-center">
              <div className=" w-full border border-gray-400 p-5 flex flex-col justify-between leading-normal">
                <div className="mb-8">
                  {selectedPost === post.title && (
                    <div className="text-xs p-1 bg-amber-50">
                      You selected this post
                    </div>
                  )}
                  <div
                    className={`font-bold text-xl mb-2 ${selectedPost === post.title ? "text-red-500" : 'text-gray-900'}`}>
                    {post.title}
                  </div>
                  <p className="text-gray-700 text-base">
                    {post.body.map((el, key) => (
                      <span key={key}>{getContentBody(el.children)}</span>
                    ))}
                  </p>
                </div>
                {post.mainImage?.asset?.url && (
                  <div className="flex h-64 relative rounded leading-snug justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      onClick={() => openDialog(post.mainImage?.asset?.url)}
                      className="h-full rounded-r object-contain cursor-pointer"
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
      <Dialog
        open={isOpen}
        onClose={closeDialog}
      >
        <div className="bg-white px-16 py-14 rounded-md text-center">
          <img
            width={400}
            height={400}
            src={selectedImg}
            alt="image"
          />
        </div>
      </Dialog>
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
