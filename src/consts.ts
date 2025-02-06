import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "박병주",
  EMAIL: "beyondzux@gmail.com",
  NUM_POSTS_ON_HOMEPAGE: 3,
  NUM_EXPERIENCES_ON_HOMEPAGE: 2,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "안녕하세요! 박병주의 기술 블로그입니다.",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "제가 작성한 글의 목록입니다.",
};

export const EXPERIENCES: Metadata = {
  TITLE: "Experiences",
  DESCRIPTION: "성장의 발판이 된 경험 모음입니다.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION:
    "참여한 프로젝트의 목록입니다. 데모 링크와 설명을 확인하실 수 있습니다.",
};

export const SOCIALS: Socials = [
  {
    NAME: "github",
    HREF: "https://github.com/parkblo",
  },
];
