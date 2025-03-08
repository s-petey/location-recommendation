import { useMutation } from '@tanstack/react-query';
import { Link, createFileRoute, useRouter } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { getEvent, setCookie } from '@tanstack/start/server';
import { type } from 'arktype';
import { Auth } from '~/components/Auth.jsx';
import {
  type EmailAuth,
  createCookieForServerAuth,
  emailAuthSchema,
} from '~/lib/auth.helpers.js';
import { auth } from '~/lib/auth.js';
import { env } from '~/lib/env';

export const signupFn = createServerFn()
  .validator((data: EmailAuth) => {
    const result = emailAuthSchema(data);

    if (result instanceof type.errors) {
      console.error('parseError: ', result.summary);

      throw new Error(result.summary);
    }

    return result;
  })
  .handler(async ({ data }) => {
    if (!env.VITE_ALLOWED_EMAILS.includes(data.email)) {
      throw new Error('Email not allowed - contact website owner.');
    }

    const signUpResponse = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.email,
      },
      asResponse: true,
    });

    const headers = signUpResponse.headers;

    const cookiesToSet = createCookieForServerAuth(headers);
    const event = getEvent();

    for (const { key, value, options } of cookiesToSet) {
      setCookie(event, key, value, options);
    }

    const to = data.redirectUrl || '/category';

    return { to };

    // TODO: This redirect doesn't work....
    // Redirect to the prev page stored in the "redirect" search param
    // throw redirect({
    //   href: data.redirectUrl || '/',
    // });
  });

export const Route = createFileRoute('/signup')({
  component: SignupComp,
});

function SignupComp() {
  const router = useRouter();
  const signupMutation = useMutation({
    mutationFn: signupFn,
    onSuccess: (data) => {
      if (data?.to) {
        router.navigate({
          to: data.to,
          from: '/signup',
        });
      }
    },
  });

  return (
    <>
      <Auth
        actionText="Sign Up"
        status={signupMutation.status}
        onSubmit={(e) => {
          const formData = new FormData(e.target as HTMLFormElement);

          signupMutation.mutate({
            data: {
              email: formData.get('email') as string,
              password: formData.get('password') as string,
            },
          });
        }}
        afterSubmit={
          signupMutation.error ? (
            <>
              <div className="text-red-400">{signupMutation.error.message}</div>
            </>
          ) : null
        }
      />

      <hr className="my-4" />
      <div className="text-center text-sm">or</div>
      <hr className="my-4" />
      <div className="flex justify-center">
        <Link
          to="/login"
          className="rounded-sm bg-cyan-600 px-2 py-2 font-black text-sm text-white uppercase hover:bg-cyan-700"
        >
          Have an account?
        </Link>
      </div>
    </>
  );
}
