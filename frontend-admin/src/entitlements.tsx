import {
    List,
    useRecordContext,
    Datagrid,
    TextField,
    BooleanInput,
    Create,
    Edit,
    SimpleForm,
    TextInput,
    ArrayField,
    ReferenceArrayInput,
    SelectArrayInput,
    DateInput
} from "react-admin";

const EntitlementTitle = () => {
    const record = useRecordContext();
    return <span>Entitlement {record ? `"${record.name}"` : ''}</span>;
};

export const DescriptionShort = () => {
    const record = useRecordContext();
    const str = record.description;
    return record ? <span>{str.length > 30 ?  str.slice(0, 30) + "..." : str}</span> : null;
}
DescriptionShort.defaultProps = { label: 'Description' };

export const EntitlementList = () => (
    <List>
        <Datagrid bulkActionButtons={false} rowClick="edit">
            <TextField source="name" />
            <TextField source="provider_trigger" />
            <TextField source="is_active" />
        </Datagrid>
    </List>
);

export const EntitlementEdit = () => (
    <Edit title={<EntitlementTitle />}>
        <SimpleForm>
            <div>
                <TextInput source="name" required style={{ display: 'inline', float: 'left' }} />
                <TextInput source="provider_trigger" required style={{ marginLeft: '20px' }} />
            </div>
            <div>
                <TextInput multiline source="description" resettable sx={{ width: 450, float: 'left' }} />
                <TextInput multiline source="summary"resettable  sx={{ width: 450, marginLeft: '20px' }} />
            </div>
            <div>
                <DateInput source="start_date" style={{ display: 'inline', float: 'left' }} />
                <DateInput source="end_date" style={{ marginLeft: '20px', float: 'left' }} />
                <div style={{ marginLeft: '40px', float: 'left' }}>
                    <ArrayField source="products" label="Products">
                        <Datagrid bulkActionButtons={false} >
                            <TextField source="name" label="Current Products"/>
                            <DescriptionShort />
                            <TextField source="is_active" />
                        </Datagrid>
                    </ArrayField>
                </div>
            </div>
            <BooleanInput source="is_active" />
            <h3>Associated Providers</h3>
            <ArrayField source="providers" label="Providers">
                <Datagrid >
                    <TextField source="name" />
                    <TextField source="namespace_key" />
                    <TextField source="is_active" />
                </Datagrid>
            </ArrayField>
            <ReferenceArrayInput source="newProviders" reference="providers">
                <SelectArrayInput source="name" label="provider" sx={{ width: 450 }} helperText="Add a new Provider to the Entitlement"/>
            </ReferenceArrayInput>
        </SimpleForm>
    </Edit>
);

export const EntitlementCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="name" required />
            <TextInput source="provider_trigger" required />
            <TextInput fullWidth multiline source="description" />
            <TextInput fullWidth multiline source="summary" />
            <BooleanInput source="is_active" />
            <DateInput source="start_date" />
            <DateInput source="end_date" />
            <ReferenceArrayInput source="providers" reference="providers">
                <SelectArrayInput source="name" label="provider" required />
            </ReferenceArrayInput>
        </SimpleForm>
    </Create>
);