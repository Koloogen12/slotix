import { redirect } from "next/navigation";

// Slotix: the App Store is retired — /apps sends users to their Integrations hub.
const ServerPage = async () => {
  redirect("/apps/installed/calendar");
};

export default ServerPage;
