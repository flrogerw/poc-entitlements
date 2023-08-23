/* eslint-disable no-unused-vars */
import { Admin, Resource} from "react-admin";
import { Dashboard } from "./Dashboard";
import { dataProvider } from "./dataProvider";
import { ProductList, ProductEdit, ProductCreate  } from "./products";
import { EntitlementList, EntitlementEdit, EntitlementCreate } from "./entitlements";
import { ProviderList, ProviderEdit, ProviderCreate } from "./providers";
import { SubscriberEdit, SubscriberList, SubscriberCreate } from "./subscribers";

export const App = () =>   <Admin dataProvider={dataProvider} dashboard={Dashboard}>
   <Resource name="products" list={ProductList} edit={ProductEdit} create={ProductCreate}/>
   <Resource name="entitlements" list={EntitlementList} edit={EntitlementEdit} create={EntitlementCreate}/>
   <Resource name="providers" list={ProviderList} edit={ProviderEdit} create={ProviderCreate} />
   <Resource name="subscribers" list={SubscriberList} edit={SubscriberEdit} create={SubscriberCreate}/>
  </Admin>;
