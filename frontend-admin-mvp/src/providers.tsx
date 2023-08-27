import {
    List,
    useRecordContext,
    Datagrid,
    TextField,
    BooleanInput,
    Create,
    DateInput,
    Edit,
    SimpleForm,
    TextInput,
    ArrayField,
    ReferenceArrayInput,
    SelectArrayInput
} from "react-admin";

const ProviderTitle = () => {
    const record = useRecordContext();
    return <span>Provider {record ? `"${record.name}"` : ''}</span>;
};

export const ProviderList = () => (
    <List>
        <Datagrid bulkActionButtons={false} rowClick="edit">
            <TextField source="name" />
            <TextField source="api_key" />
            <TextField source="namespace_key" />
            <TextField source="is_active" />
        </Datagrid>
    </List>
);

export const ProviderEdit = () => (
    <Edit title={<ProviderTitle />}>
        <SimpleForm>
            <div>
                <TextInput source="namespace_key" disabled style={{ float: 'left' }} />
                <TextInput source="api_key" disabled style={{ marginLeft: '20px' }} />
                <button style={{ marginLeft: '20px', marginTop: '20px', borderRadius: '12px', color: 'white', backgroundColor: '#0394fc' }}>Create New API Key</button>
            </div>
            <div>
                <TextInput source="name" style={{ display: 'inline', float: 'left' }} />
                <TextInput multiline source="description" sx={{ width: 450, marginLeft: '20px' }} />
            </div>
            <div>
                <DateInput source="start_date" style={{ display: 'inline', float: 'left' }} />
                <DateInput source="end_date" style={{ marginLeft: '20px' }} />
            </div>
            <BooleanInput source="is_active" />
            <h3>Associated Entitlements</h3>
            <ArrayField source="entitlements">
                <Datagrid>
                    <TextField source="name" />
                    <TextField source="description" />
                    <TextField source="is_active" />
                </Datagrid>
            </ArrayField>
            <ReferenceArrayInput source="newEntitlements" reference="entitlements" >
                <SelectArrayInput label="Entitlements" helperText="Add a new Entitlement to the Provider" sx={{ width: 450 }} />
            </ReferenceArrayInput>
        </SimpleForm>
    </Edit>
);

export const ProviderCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="name" />
            <TextInput multiline source="description" />
            <BooleanInput source="is_active" />
            <DateInput source="start_date" />
            <DateInput source="end_date" />
        </SimpleForm>
    </Create>
);