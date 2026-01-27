'use client'
import CustomSocialButton from "@/app/components/forms/theme-elements/CustomSocialButton";
import { Stack } from "@mui/system";
import { Avatar, Box } from "@mui/material";
import { signInType } from "@/app/types/auth/auth";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

const AuthSocialButtons = ({ title }: signInType) => (
  <>
    {/* <Stack direction="row" justifyContent="center" spacing={2} mt={3}>
      <CustomSocialButton component="a" href={`${backendUrl.replace(/\/$/, '')}/auth/google`}>
        <Avatar
          src={"/images/svgs/google-icon.svg"}
          alt={"google"}
          sx={{ width: 16, height: 16, borderRadius: 0, mr: 1 }}
        />
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, whiteSpace: 'nowrap', mr: { sm: '3px' } }}>
          {title}{" "}
        </Box>{" "}
        Google
      </CustomSocialButton>
      <CustomSocialButton component="a" href={`${backendUrl.replace(/\/$/, '')}/auth/instagram`}>
        <Avatar
          src={"/images/svgs/facebook-icon.svg"}
          alt={"instagram"}
          sx={{ width: 18, height: 18, borderRadius: 0, mr: 1 }}
        />
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, whiteSpace: 'nowrap', mr: { sm: '3px' } }}>
          {title}{" "}
        </Box>{" "}
        Instagram
      </CustomSocialButton>
    </Stack> */}
  </>
);

export default AuthSocialButtons;
