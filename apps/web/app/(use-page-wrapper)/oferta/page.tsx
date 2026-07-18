import { APP_NAME } from "@calcom/lib/constants";
import { _generateMetadata } from "app/_utils";
import {
  OFERTA_BLOCKS,
  OFERTA_EFFECTIVE_DATE,
  OFERTA_INTRO,
  OFERTA_REQUISITES,
  OFERTA_TITLE,
} from "~/legal/content/oferta";
import LegalDocument from "~/legal/LegalDocument";

const Page = () => (
  <LegalDocument
    title={OFERTA_TITLE}
    effectiveDate={OFERTA_EFFECTIVE_DATE}
    intro={OFERTA_INTRO}
    blocks={OFERTA_BLOCKS}
    requisites={OFERTA_REQUISITES}
  />
);

export const generateMetadata = async () => {
  return await _generateMetadata(
    () => `${APP_NAME} - ${OFERTA_TITLE}`,
    () => OFERTA_TITLE,
    true,
    undefined,
    "/oferta"
  );
};

export default Page;
