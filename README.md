# `dcli`
dingchao's cli which can initialize some common useful template, currently it can contain create a lib template which we can develop a lib base on it.

# install
`yarn/npm/pnpm install dcli`

## precondition
first you must be a monorepo structure, then it will create a sub repo in the monorepo folder, Proposal to use pnpm to manage monorepo workspace

## how to create a lib
`./node_modules/.bin/dcli create-lib mylib --libNS @myns --createdAt ./packages`



