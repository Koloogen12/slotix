import { APP_NAME } from "@calcom/lib/constants";
import { _generateMetadata } from "app/_utils";
import {
  PRIVACY_BLOCKS,
  PRIVACY_EFFECTIVE_DATE,
  PRIVACY_REQUISITES,
  PRIVACY_TITLE,
} from "~/legal/content/privacy";
import LegalDocument from "~/legal/LegalDocument";

const Page = () => (
  <LegalDocument
    title={PRIVACY_TITLE}
    effectiveDate={PRIVACY_EFFECTIVE_DATE}
    blocks={PRIVACY_BLOCKS}
    requisites={PRIVACY_REQUISITES}
  />
);

export const generateMetadata = async () => {
  return await _generateMetadata(
    () => `${APP_NAME} - ${PRIVACY_TITLE}`,
    () => PRIVACY_TITLE,
    true,
    undefined,
    "/privacy"
  );
};

export default Page;
