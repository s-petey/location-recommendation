import { useMutation } from '@tanstack/react-query';
import { Link, createFileRoute, useRouter } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { getEvent, setCookie } from '@tanstack/start/server';
import { type } from 'arktype';
import { Auth } from '~/components/Auth';
import { auth } from '~/lib/auth';
import {
  type EmailAuth,
  createCookieForServerAuth,
  emailAuthSchema,
} from '~/lib/auth.helpers';

export const Route = createFileRoute('/login')({
  component: LoginComp,
});

export const loginFn = createServerFn({
  method: 'POST',
})
  .validator((data: EmailAuth) => {
    const result = emailAuthSchema(data);

    if (result instanceof type.errors) {
      console.error('parseError: ', result.summary);

      throw new Error(result.summary);
    }

    return result;
  })
  .handler(async ({ data }) => {
    const signInResponse = await auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password,
      },
      asResponse: true,
    });

    const headers = signInResponse.headers;

    const cookiesToSet = createCookieForServerAuth(headers);
    const event = getEvent();

    for (const { key, value, options } of cookiesToSet) {
      setCookie(event, key, value, options);
    }

    const to = data.redirectUrl || '/category';

    return { to };

    // TODO: For whatever reason this
    // redirect doesn't seem to work...
    // maybe it is a useMutation thing?
    // throw redirect({
    //   // href: data.redirectUrl || '/',
    //   href: to,
    //   // to,
    //   from: '/login',

    //   // replace: true,
    // });
  });

function LoginComp() {
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: loginFn,
    onSuccess: (data) => {
      if (data?.to) {
        router.navigate({
          to: data.to,
          from: '/login',
        });
      }
    },
  });

  return (
    <>
      <Auth
        actionText="Login"
        status={loginMutation.status}
        onSubmit={(e) => {
          const formData = new FormData(e.target as HTMLFormElement);

          loginMutation.mutate({
            data: {
              email: formData.get('email') as string,
              password: formData.get('password') as string,
            },
          });
        }}
        afterSubmit={
          loginMutation.error?.message ? (
            <>
              <div className="text-red-400">{loginMutation.error?.message}</div>
            </>
          ) : null
        }
        // TODO: Consider the following:
        // afterSubmit={
        // loginMutation.data ? (
        //   <>
        //     <div className='text-red-400'>{loginMutation.data.message}</div>
        //     {loginMutation.data.userNotFound ? (
        //       <div>
        //         <button
        //           className='text-blue-500'
        //           onClick={(e) => {
        //             const formData = new FormData(
        //               (e.target as HTMLButtonElement).form!
        //             );

        //             signupMutation.mutate({
        //               email: formData.get('email') as string,
        //               password: formData.get('password') as string,
        //             });
        //           }}
        //           type='button'
        //         >
        //           Sign up instead?
        //         </button>
        //       </div>
        //     ) : null}
        //   </>
        // ) : null
        // }
      />
      <hr className="my-4" />
      <div className="text-center text-sm">or</div>
      <hr className="my-4" />
      <div className="flex justify-center">
        <Link
          to="/signup"
          className="rounded-sm bg-cyan-600 px-2 py-2 font-black text-sm text-white uppercase hover:bg-cyan-700"
        >
          Sign up instead?
        </Link>
      </div>
    </>
  );
}
