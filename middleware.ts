import { auth } from "./auth";

export default auth((req) => {
    //Login bảo vệ route
});

export const config = {
    matcher: ["/teambuilder/:path*", "/battle/:path*"]
}