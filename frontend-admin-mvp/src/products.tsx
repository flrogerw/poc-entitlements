import {
    List,
    useRecordContext,
    Datagrid,
    TextField,
    BooleanInput,
    Create,
    DateInput,
    Edit,
    NumberInput,
    SimpleForm,
    TextInput,
    ArrayField,
    ReferenceArrayInput,
    SelectArrayInput,
} from "react-admin";

const ProductTitle = () => {
    const record = useRecordContext();
    return <span>Product {record ? `"${record.name}"` : ''}</span>;
};

export const DescriptionShort = () => {
    const record = useRecordContext();
    const str = record.description;
    return record ? <span>{str.length > 50 ? str.slice(0, 50) + "..." : str}</span> : null;
}
DescriptionShort.defaultProps = { label: 'Description' };


export const ProductList = () => (
    <List>
        <Datagrid bulkActionButtons={false} rowClick="edit">
            <TextField source="name" />
            <DescriptionShort />
            <TextField source="price" />
            <TextField source="is_active" />
            <TextField source="is_internal" />
        </Datagrid>
    </List>
);

export const ProductEdit = () => (
    <Edit title={<ProductTitle />}>
        <SimpleForm>
            <div>
                <TextInput source="payment_processor" label="Payment Processor" disabled />
                <TextInput source="payment_id" label="Payment Processor Product ID" disabled sx={{ marginLeft: '20px' }} />
                <TextInput source="price_id" label="Payment Processor Price ID" disabled sx={{ marginLeft: '20px' }} />
            </div>
            <div>
                <TextInput source="name" sx={{ float: 'left', width: 300 }}/>
                <NumberInput source="price" sx={{ marginLeft: '20px', float: 'left' }} />
                <div style={{ marginLeft: '20px', float: 'left' }}>
                    <BooleanInput source="is_active" />
                    <BooleanInput helperText="No product created within Payment Processor" source="is_internal" disabled/>
                </div>
            </div>
            <TextInput multiline source="description" resettable sx={{ width: 650 }} />
            <div>
            <DateInput source="start_date" />
            <DateInput source="end_date" sx={{ marginLeft: '20px' }}/>
            </div>
            <h3>Associated Entitlements</h3>
            <ArrayField source="entitlements">
                <Datagrid>
                    <TextField label="Entitlement" source="name" />
                    <TextField source="is_active" />
                    <TextField source="start_date" label="Date Created"/>
                    <TextField source="end_date" />
                </Datagrid>
            </ArrayField>
            <ReferenceArrayInput source="newEntitlements" reference="entitlements">
                <SelectArrayInput source="name" label="Entitlements" sx={{ width: 450 }} helperText="Add a new Entitlement to the Product"/>
            </ReferenceArrayInput>
        </SimpleForm>
    </Edit>
);

export const ProductCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="name" required />
            <TextInput fullWidth multiline source="description" />
            <NumberInput source="price" required />
            <BooleanInput source="is_active" />
            <BooleanInput source="is_internal" />
            <ReferenceArrayInput source="entitlements" reference="entitlements">
                <SelectArrayInput source="name" label="Entitlements" required />
            </ReferenceArrayInput>
            <DateInput source="start_date" />
            <DateInput source="end_date" />
        </SimpleForm>
    </Create>
);
