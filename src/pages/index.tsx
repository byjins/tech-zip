import type { ReactNode } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout>
      <section className={"flex flex-col gap-10"}>
        <article>
          <div className={"flex gap-5 items-center flex-wrap"}>
            <div className={"w-36 h-36 relative"}>
              <img src={""} alt={"프로필"} />
            </div>
            <a href="mailto:ppwm111@naver.com" className="hover:underline">
              - ppwm111@naver.com
            </a>
            <h1 className={"text-lg font-bold italic my-4"}></h1>
          </div>
          <ul>
            {[].map(({ title, description }) => (
              <li className={"my-2"} key={title}>
                <h6 className={"font-bold mb-1"}>{title}</h6>
                <p className={"text-md dark:text-gray-400"}>{description}</p>
              </li>
            ))}
          </ul>
        </article>
        <article className={"md:flex gap-6"}>
          <div className={"flex flex-col gap-5 md:w-2/3 mb-5"}>
            <div>
              <h2 className={"text-lg mb-2 italic font-bold"}>
                Work experience
              </h2>
              <div className={"flex flex-col gap-6"}>
                <div className={"flex gap-5 items-center justify-between"}>
                  <div className={"flex flex-col"}>
                    <span>(주) 피플앤드테크놀러지</span>
                    <span className={"text-gray-500"}>솔루션 개발팀</span>
                  </div>
                  <p>2023.03.13 ~ ing</p>
                </div>
              </div>
            </div>
          </div>
          <div className={"flex flex-col gap-5 md:w-1/3 mb-5"}>
            <div>
              <h2 className={"text-lg mb-2 italic font-bold"}>Skill</h2>
              <ul className={"relative"}>
                {[].map((skill) => (
                  <li key={skill} className={"flex gap-3"}>
                    <span>️-</span>
                    <p>{skill}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </section>
    </Layout>
  );
}
