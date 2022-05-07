import { useRouter } from "next/router";
import { useState } from "react";
import { Formik } from "formik";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

import Layout from "../components/Layout";

import useAuth from "../store/authStore";

const Login = () => {
    const login = useAuth((state) => state.login);
    const logout = useAuth((state) => state.logout);
    const router = useRouter();

    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    return (
        <Layout>
            <div className="relative flex h-full min-h-[80vh] w-full flex-col items-center justify-center overflow-hidden shadow">
                <Formik
                    initialValues={{ email: "", password: "" }}
                    validate={(values) => {
                        const errors = {};
                        if (!values.email) {
                            errors.email = "Required";
                        } else if (
                            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
                                values.email
                            )
                        ) {
                            errors.email = "Invalid email address";
                        }
                        return errors;
                    }}
                    onSubmit={(values, { setSubmitting }) => {
                        const client = new ApolloClient({
                            uri: process.env.BACKEND_GRAPHQL_URL,
                            cache: new InMemoryCache(),
                        });

                        client
                            .mutate({
                                mutation: gql`
									mutation {
										login(email: "${values.email}", password: "${values.password}") {
											access_token
										}
									 }
								`,
                            })
                            .then((result) => {
                                // Enable button
                                setSubmitting(false);

                                // Remove alerts if any
                                setShowErrorAlert(false);

                                // Get token from response
                                const token = result.data?.login.access_token;

                                logout();

                                // Add token to store
                                login(token);

                                router.push("/createInvite");
                            })
                            .catch((err) => {
                                setShowErrorAlert(true);
                                setSubmitting(false);
                                setErrorMessage(err.message);
                            });
                    }}
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        isSubmitting,
                    }) => (
                        <form
                            onSubmit={handleSubmit}
                            className="prose form-control space-y-4 rounded-xl bg-base-300 p-14 md:p-28"
                        >
                            <h1>Welcome Back 👋</h1>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                autoComplete="username"
                                className="input input-bordered w-full max-w-xs"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.email}
                            ></input>
                            <span className="text-error">
                                {errors.email && touched.email && errors.email}
                            </span>
                            <input
                                type="password"
                                name="password"
                                autoComplete="current-password"
                                placeholder="Password"
                                className="input input-bordered w-full max-w-xs"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.password}
                            ></input>
                            <button
                                className="btn btn-primary"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                Submit
                            </button>
                        </form>
                    )}
                </Formik>

                <div
                    className={`drop-alert absolute top-3 ${
                        showErrorAlert ? "active" : ""
                    }`}
                >
                    <div className="alert alert-error shadow-lg">
                        <div>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 flex-shrink-0 stroke-current"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <span>Error! {errorMessage}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Login;
