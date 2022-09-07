#!/usr/bin/env node

const program = require('commander')
const path = require('path');
const chalk = require('chalk')
const ora = require('ora');
const { spawn } = require('@malept/cross-spawn-promise');
const inquirer = require('inquirer');
const package  = require('../package.json');
const fs = require('fs-extra');
const Handlebars = require('handlebars')
const spinner = ora("开始创建lib template");

const defaultCreateAt = './packages';
const defaultNS = '@dingchao';
const defaultAuthor = 'dingchao';

program
.name('betalpha')
.version(package.version)
// create lib command
.command('create-lib')
.argument('<lib name>', '组件库名称')
.description('创建一个组件库')
.option('-n --libNS <lib namespace>', 'lib的命名空间, 如果不指定则默认为@betalpha', defaultNS)
.option('-c --createdAt <relative path>', '指定组件库初始化模板的目录, 如果不指定则会创建到monorepo的workspace的默认目录packages下面', defaultCreateAt)
.action(async(tplName, options) => {
  const currentLibRoot = path.resolve(process.argv[1], '../..');
  const cwd = process.cwd();
  const libNS = options.libNS;
  const createdAt = options.createdAt;
  const distRoot = path.resolve(cwd, createdAt);
  const packageJson = await fs.readJSON(path.resolve(currentLibRoot, 'template', 'lib-template', 'package.json'));
  const template = Handlebars.compile(JSON.stringify(packageJson));
  const { libName, author } = await inquirer.prompt([
      {
        type: 'input',
        name: 'libName',
        message: `请指定组件库的名称, 请注意这个名称是package.json里面的名称, 是组件库发布用到的名称并且默认会冠以${defaultNS}的命名空间, 该名称默认和组件库的根目录名称相同`,
        default: tplName
      },
      {
          type: 'input',
          name: 'author',
          message: '请指定组件库的作者',
          default: defaultAuthor
        }
    ]);
  const packageName = `${libNS}/${libName}`;
  const targetPackage = template({ libName: packageName, author });
  spinner.start();
  spinner.text = '开始copy template';
  await fs.copy(
      path.resolve(currentLibRoot, 'template', 'lib-template'),
      path.resolve(distRoot, tplName),
      { overwrite: true }
  );
  spinner.text = '开始应用package.json';
  await fs.writeJSON(path.resolve(distRoot, tplName, 'package.json'), JSON.parse(targetPackage), { spaces: 4 })
  spinner.text = '开始应用package.json';

  spinner.text = '开始安装node modules';

  try {
    await spawn('pnpm', ['install', `--filter=${packageName}`], { 
      stdio: 'inherit' 
    });
  } catch(e) {
      // console.error(e);
  } finally {
      spinner.text = '开始安装node modules完成';
      spinner.succeed('创建成功');
  }
})

program.parse()
