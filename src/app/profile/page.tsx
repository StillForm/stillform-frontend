import { Order, Physicalization } from "@/app/api/mock/data";
import { GET as getOrders } from "@/app/api/me/orders/route";
import { GET as getPhysicalizations } from "@/app/api/me/physicalizations/route";
import { ProfileClientPage } from "./profile-client-page";

async function getInitialProfileData() {
  try {
    const [ordersRes, physicalizationsRes] = await Promise.all([
      getOrders(),
      getPhysicalizations(),
    ]);

    if (!ordersRes.ok || !physicalizationsRes.ok) {
      throw new Error("Failed to fetch initial profile data");
    }

    const orders = await ordersRes.json();
    const physicalizations = await physicalizationsRes.json();

    return { orders, physicalizations };
  } catch (error) {
    console.error("Error fetching initial profile data:", error);
    return { orders: [], physicalizations: [] };
  }
}

export default async function ProfilePage() {
  const { orders, physicalizations } = await getInitialProfileData();

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold tracking-tight mb-8">My Profile</h1>
      <ProfileClientPage
        initialOrders={orders}
        initialPhysicalizations={physicalizations}
      />
    </div>
  );
}

