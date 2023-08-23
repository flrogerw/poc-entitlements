import { Card, CardContent } from "@mui/material";

export const Dashboard = () => (
    <div>
        <h2>Entitlements</h2>
        <Card style={{ backgroundSize: 'cover', background: 'url(/binary.gif)' }}>
            <CardContent style={{ justifyContent: "center", alignItems: "center", display: "flex" }}> <img width="900px" src="switchboard.gif" /></CardContent>
        </Card>
    </div>
);