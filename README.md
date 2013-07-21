# かんばんりすと for github issues

GitHubのissueを「かんばんりすと」のUIで管理したい

![スクリーンショット] (https://dl.dropboxusercontent.com/u/1215986/kanban-list-for-github.png)

# 仕様(今のところ)

* 初期ログイン時に全リポジトリ(issueは含まない)を同期
* 最初にリポジトリを表示するタイミングで issue を同期
* issue に対する操作は随時同期(追加、編集、削除、Done)
* タスクの一行目がタイトル、それ以降は本文として issue に保存する
* 「Sync Issues」ボタンで任意のタイミングで issue を同期
* 「Sync Repositories」で任意のタイミングで Repository を同期(増えたものは追加される)
 
## License
(The MIT License)

Copyright (c) 2013 Naoki KODAMA <naoki.koda@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

