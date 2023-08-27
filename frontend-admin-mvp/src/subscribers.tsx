import {
    List,
    useRecordContext,
    Datagrid,
    TextField,
    BooleanInput,
    DateInput,
    Edit,
    Create,
    SimpleForm,
    TextInput,
    ArrayField,
    ReferenceArrayInput,
    SelectArrayInput,
} from "react-admin";

const SubscriberTitle = () => {
    const record = useRecordContext();
    return <span>Subscribers {record ? `"${record.name}"` : ''}</span>;
};

export const SubscriberList = () => (
    <List>
        <Datagrid rowClick="edit" bulkActionButtons={false}>
            <TextField source="name" />
            <TextField source="unique_identifier" label="Unique Identifier" />
            <TextField source="payment_id" />
            <TextField source="payment_processor" label="Payment Processor" />
            <TextField source="is_active" />
        </Datagrid>
    </List>
);

export const SubscriberEdit = () => (
    <Edit title={<SubscriberTitle />}>

        <SimpleForm>
            <div>
                <TextInput source="payment_id" label="Payment Processor Id" disabled style={{ display: 'inline', float: 'left' }} />
                <TextInput source="payment_processor" label="Payment Processor" disabled style={{ display: 'inline', float: 'left', marginLeft: '20px' }} />
                <TextInput source="unique_identifier" label="Unique Identifier" disabled style={{ display: 'inline', float: 'left', marginLeft: '20px' }} />
            </div>
            <div>
                <TextInput source="name" required style={{ display: 'inline', float: 'left' }} />
                <DateInput source="start_date" style={{ display: 'inline', float: 'left', marginLeft: '20px' }} />
                <DateInput source="end_date" style={{ display: 'inline', float: 'left', marginLeft: '20px' }} />
                <div style={{ display: 'inline', float: 'left', marginLeft: '50px' }}><BooleanInput source="is_active" /></div>
            </div>
            <h3>Current Products</ h3>
            <ArrayField source="products">
                <Datagrid>
                    <TextField source="name" />
                    <TextField source="is_active" />
                    <TextField source="start_date" />
                    <TextField source="end_date" />
                </Datagrid>
            </ArrayField>
            <h3>Current Entitlements</ h3>
            <ArrayField source="entitlements" >
                <Datagrid>
                    <TextField source="name" />
                    <TextField source="is_active" label="Client Enabled" />
                    <TextField source="start_date" />
                    <TextField source="end_date" />   
                    <TextField source="is_active" label="Entitlement Active" />
                </Datagrid>
            </ArrayField>
        </SimpleForm>
    </Edit >
);

export const SubscriberCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="name" required />
            <BooleanInput source="is_active" />
            <DateInput source="start_date" />
            <DateInput source="end_date" />
            <h3>Enable Products</ h3>
            <ReferenceArrayInput source="newProducts" reference="products" >
                <SelectArrayInput label="Products" />
            </ReferenceArrayInput>
            <h3>Enable Entitlements</ h3>
            <ReferenceArrayInput source="newEntitlements" reference="entitlements" >
                <SelectArrayInput label="Entitlements" />
            </ReferenceArrayInput>
        </SimpleForm>
    </Create>
);