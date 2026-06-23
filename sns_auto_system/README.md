# 岐阜スタジオ SNS自動化システム

Google Driveなどに保存した写真をもとに、Instagram / Threads / X 向けの投稿案、ハッシュタグ、投稿予定日をCSVで作る最小構成のツールです。

## 1. 全体設計

最初は自動投稿をしません。

流れは次のとおりです。

1. 写真フォルダを読み込む
2. 写真が入っているフォルダ名からカテゴリを判定する
3. Instagram用の文章を作る
4. Threads用の文章を作る
5. X用の文章を作る
6. ハッシュタグを作る
7. 投稿予定日を作る
8. CSVファイルに出力する

文章生成は、まずは確実に動くように「テンプレート方式」です。
テンプレート方式とは、あらかじめ用意した文章の型にカテゴリ情報を入れて投稿文を作る方法です。
将来、OpenAI APIなどを使ったAI文章生成に差し替えやすいよう、ファイルを分けています。

## 2. フォルダ構成

```text
sns_auto_system/
  README.md
  main.py
  config.py
  photo_reader.py
  category.py
  text_generator.py
  scheduler.py
  csv_exporter.py
  photos/
    スタジオ外観/
    スタジオ内観/
    自然光/
    ポートレート/
    コスプレ/
    機材紹介/
    空き日告知/
    キャンペーン/
    お客様作品/
  output/
```

それぞれの役割です。

```text
main.py             実行する入口
config.py           スタジオ情報、カテゴリ、ハッシュタグなどの設定
photo_reader.py     写真ファイルを探す
category.py         フォルダ名からカテゴリを判定する
text_generator.py   SNS投稿文とハッシュタグを作る
scheduler.py        投稿予定日を作る
csv_exporter.py     CSVを書き出す
photos/             写真を入れる場所
output/             CSVの出力先
```

## 3. 必要ソフト

必要なのは次の1つだけです。

```text
Python 3
```

Pythonは、プログラムを動かすためのソフトです。
macOS Montereyには最初から `python3` が入っていることが多いです。

## 4. インストール手順

まずターミナルで、このフォルダへ移動します。

```bash
cd "/Users/shibataakihiro/Documents/New project"
```

Pythonが使えるか確認します。

```bash
python3 --version
```

`Python 3.x.x` のように表示されれば大丈夫です。

追加インストールは不要です。

## 使い方

まず、写真をカテゴリ別フォルダに入れます。

例:

```text
sns_auto_system/photos/自然光/sample1.jpg
sns_auto_system/photos/ポートレート/sample2.png
```

Google Driveで同期している「岐阜スタジオSNS」フォルダを使う場合は、下の「Google Drive同期フォルダを使う方法」を先に設定してください。

次に実行します。

```bash
python3 sns_auto_system/main.py
```

成功すると、次のCSVが作られます。

```text
sns_auto_system/output/posts.csv
```

開始日を指定したい場合は、次のようにします。

```bash
python3 sns_auto_system/main.py --start-date 2026-06-11
```

投稿間隔を変えたい場合は、次のようにします。

```bash
python3 sns_auto_system/main.py --interval-days 2
```

## 写真フォルダについて

Google Driveをインターネット経由で直接読む機能は、今回はまだ入れていません。
ただし、Google DriveアプリでMacに同期されているフォルダなら読み込めます。

将来、Google Drive連携を追加するときは、`photo_reader.py` を拡張します。

## Google Drive同期フォルダを使う方法

Google Driveで同期されているフォルダは、Macから見ると普通のフォルダです。
そのため、プログラムには「そのフォルダの場所」を設定します。

### 1. Finderで場所を確認する

1. Finderを開きます。
2. 左側のサイドバーから `Google Drive` を開きます。
3. その中にある `岐阜スタジオSNS` フォルダを探します。
4. `岐阜スタジオSNS` フォルダを右クリックします。
5. `情報を見る` をクリックします。
6. `場所` に表示されている内容を確認します。

よくある場所は、次のような形です。

```text
/Users/ユーザー名/Library/CloudStorage/GoogleDrive-メールアドレス/マイドライブ/岐阜スタジオSNS
```

または、環境によっては次のような形です。

```text
/Users/ユーザー名/Library/CloudStorage/GoogleDrive-メールアドレス/My Drive/岐阜スタジオSNS
```

`ユーザー名` や `メールアドレス` は、お使いのMacとGoogleアカウントによって変わります。

### 2. パスをコピーする簡単な方法

Finderで `岐阜スタジオSNS` フォルダを選択した状態で、次を押します。

```text
optionキーを押しながら右クリック
```

メニューに `“岐阜スタジオSNS”のパス名をコピー` のような項目が出ます。
それをクリックすると、フォルダの場所をコピーできます。

### 3. プログラムに設定する

次のファイルを開きます。

```text
sns_auto_system/config.py
```

この行を探します。

```python
PHOTO_FOLDER_PATH = ""
```

コピーしたGoogle Driveのパスを、ダブルクォーテーションの中に貼り付けます。

例:

```python
PHOTO_FOLDER_PATH = "/Users/shibataakihiro/Library/CloudStorage/GoogleDrive-example@gmail.com/マイドライブ/岐阜スタジオSNS"
```

これで、次から普通に実行するだけでGoogle Drive側のフォルダを読み込みます。

```bash
python3 sns_auto_system/main.py
```

### 4. コマンドで一時的に指定する方法

設定ファイルを書き換えず、1回だけGoogle Driveフォルダを指定することもできます。

```bash
python3 sns_auto_system/main.py --photo-folder "/Users/shibataakihiro/Library/CloudStorage/GoogleDrive-example@gmail.com/マイドライブ/岐阜スタジオSNS"
```

初心者の方には、毎回入力しなくてよい `config.py` に設定する方法がおすすめです。

## GUI版の使い方

ターミナル操作に慣れていない方向けに、ブラウザで使える画面も用意しています。
GUIとは、文字の命令ではなくボタンや入力欄で操作できる画面のことです。

画面のタイトルは次の名前です。

```text
岐阜スタジオSNS司令室
```

### 1. 初回だけStreamlitを入れる

Streamlitは、Pythonでブラウザ画面を作るための道具です。
公式ドキュメントでも、インストールは `pip install streamlit`、起動は `streamlit run` が案内されています。

このツールでは、できるだけ簡単にするためインストール用ファイルを用意しています。

Finderで次のファイルをダブルクリックしてください。

```text
sns_auto_system/install_streamlit.command
```

途中で確認画面が出たら、許可してください。
これは初回だけで大丈夫です。

うまくいかない場合は、ターミナルで次を実行します。

```bash
cd "/Users/shibataakihiro/Documents/New project"
python3 -m pip install -r sns_auto_system/requirements.txt
```

Mac全体ではなく自分のユーザー領域に入れたい場合は、次の形でも大丈夫です。

```bash
python3 -m pip install --user -r sns_auto_system/requirements.txt
```

### 2. GUI版を起動する

Finderで次のファイルをダブルクリックしてください。

```text
sns_auto_system/start_gui.command
```

ブラウザが開き、`岐阜スタジオSNS司令室` が表示されます。

ターミナルから起動する場合は、次のコマンドです。

```bash
cd "/Users/shibataakihiro/Documents/New project"
python3 -m streamlit run sns_auto_system/app.py
```

### 3. 画面で行うこと

1. 写真フォルダのパスを入力します。
2. 投稿開始日を選びます。
3. 1日に作る投稿数を選びます。
4. Instagram / Threads / X の必要なものにチェックを入れます。
5. `投稿案を生成` ボタンを押します。
6. 生成結果を画面で確認します。
7. `CSVをoutputフォルダに保存` または `CSVをダウンロード` を押します。

### 4. 写真フォルダ選択について

ブラウザの安全上の制限により、Mac内のフォルダを完全なFinder形式で選ぶボタンは使えません。
その代わり、次の2つの方法を用意しています。

```text
方法1: Finderでフォルダのパスをコピーして貼り付ける
方法2: 画面の「Google Drive内の『岐阜スタジオSNS』候補を探す」ボタンを使う
```

Google Drive候補が見つかった場合は、表示されたパスをコピーして写真フォルダ欄に貼り付けてください。
