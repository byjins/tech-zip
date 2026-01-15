import dayjs from "dayjs";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Layout from "@theme/Layout";
import styles from "../css/index.module.css";

const skills: string[] = ["React", "TypeScript", "JavaScript"];
const studying: string[] = ["React Native", "Next.js"];

const descriptions: { title: string; description: string }[] = [
  {
    title: "복잡한 걸 단순하게 정리하는 걸 좋아합니다.",
    description:
      "무작정 구현하기보다, 왜 필요한지부터 먼저 생각합니다.  \n" +
      "복잡한 문제도 최대한 단순하게 풀어보려 하고,  \n" +
      "코드 한 줄에도 이유가 있는 구조를 만들고 싶습니다.  \n" +
      "기능보다 구조, 빠르기보다 이해하기 쉬운 코드를 중요하게 생각합니다.",
  },
  {
    title: "사용자와 팀에게 도움이 되는 개발자가 되고 싶습니다.",
    description:
      "잘 만든 UI나 성능이 좋은 것도 좋지만, 쓰기 편하고 유지보수 쉬운 경험을 우선합니다.  \n" +
      "결국 좋은 코드는 사용자와 팀 모두에게 이로운 결과를 만든다고 믿습니다.  \n" +
      "작은 코드 하나가 좋은 경험으로 이어지도록 신중하게 고민하려 합니다.",
  },
];

const calculateWorkDuration = (startDate: string) => {
  const start = dayjs(startDate);
  const end = dayjs();
  const years = end.diff(start, "year");
  const months = end.diff(start.add(years, "year"), "month");

  if (years === 0) {
    return `${months}개월`;
  }
  if (months === 0) {
    return `${years}년`;
  }
  return `${years}년 ${months}개월`;
};

export default function Home() {
  const profileSrc = useBaseUrl("/img/profile.webp");
  const todayLabel = dayjs().format("YYYY.MM.DD");
  const workStartDate = "2023.03.13";
  const workPeriod = `${workStartDate} ~ ${todayLabel}`;
  const workDuration = calculateWorkDuration(workStartDate);

  return (
    <Layout>
      <main className="container margin-vert--xl">
        <div className={styles.container}>
          <header className={styles.header}>
            <div className={styles.profile}>
              <img src={profileSrc} alt="Profile" width={120} />
            </div>

            <div className={styles.intro}>
              <h1 className={styles.title}>
                안녕하세요, Frontend Developer 유병진입니다.
              </h1>
              <div className={styles.description}>
                {descriptions.map((description, index) => (
                  <div key={description.title + index}>
                    <p
                      key={description.title}
                      className={styles.descriptionTitle}
                    >
                      {description.title}
                    </p>
                    <p key={description.description}>
                      {description.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <a href="mailto:ppwm111@naver.com" className={styles.email}>
              Email: ppwm111@naver.com
            </a>
          </header>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Experience</h2>

            <div className={styles.experienceItem}>
              <div className={styles.experienceContent}>
                <div>
                  <h3 className={styles.experienceCompany}>
                    (주) 피플앤드테크놀러지
                  </h3>
                  <p className={styles.experienceRole}>
                    솔루션 개발 1팀 / Frontend Developer
                  </p>
                </div>
                <span className={styles.experiencePeriod}>
                  {workPeriod} ( {workDuration} )
                </span>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Skills</h2>

            <div className={styles.skills}>
              {skills.map((skill) => (
                <span key={skill} className={styles.badge}>
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Studying</h2>

            <div className={styles.studying}>
              {studying.map((skill) => (
                <span key={skill} className={styles.badge}>
                  {skill}
                </span>
              ))}
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
