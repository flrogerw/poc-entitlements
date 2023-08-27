/* eslint-disable no-unused-vars */
import { Admin, Resource} from "react-admin";
import { Dashboard } from "./Dashboard";
import { dataProvider } from "./dataProvider";
import { SubscriberEdit, SubscriberList, SubscriberCreate } from "./subscribers";

export const App = () =>   <Admin dataProvider={dataProvider} dashboard={Dashboard}>

   <Resource name="subscribers" list={SubscriberList} edit={SubscriberEdit} create={SubscriberCreate}/>
  </Admin>;
