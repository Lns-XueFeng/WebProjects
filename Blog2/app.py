# pip3 freeze > requirements.txt
import sqlite3
from flask import Flask, render_template, request
from flask import Markup, url_for, redirect, flash

from markdown.extensions.toc import TocExtension
import markdown, re, os, random

from flask_wtf import FlaskForm
from flask_ckeditor import CKEditorField
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired
from flask_ckeditor import CKEditor, CKEditorField

app = Flask(__name__)

# 富文本编辑器
app.config['CKEDITOR_SERVE_LOCAL'] = True
app.config['CKEDITOR_HEIGHT'] = 400
app.secret_key = 'secret string'

ckeditor = CKEditor(app)


# 数据库操作
def creat_table():
    # 连接数据库(如果不存在则创建)
    conn = sqlite3.connect('message.db')
    # 创建游标
    cursor = conn.cursor()
    # 创建表
    sql = 'CREATE TABLE "message" ("id"	INTEGER NOT NULL,"title"' \
          '	TEXT NOT NULL,"sentence"	TEXT NOT NULL,PRIMARY KEY("id" AUTOINCREMENT))'
    cursor.execute(sql)
    # 提交事物
    conn.commit()
    # 关闭游标
    cursor.close()
    # 关闭连接
    conn.close()


def insert_conn(title, body, table):
    # 连接数据库(如果不存在则创建)
    conn = sqlite3.connect('message.db')
    # 创建游标
    cursor = conn.cursor()
    # 创建表
    sql = 'insert into {}(title,sentence) values(?,?)'.format(table)
    data = (title, body)
    cursor.execute(sql, data)
    # 提交事物
    conn.commit()
    # 关闭游标
    cursor.close()
    # 关闭连接
    conn.close()


def select_conn(table):
    # 连接数据库(如果不存在则创建)
    conn = sqlite3.connect('message.db')
    # 创建游标
    cursor = conn.cursor()
    # sql语句
    sql = "select * from {}".format(table)
    valuse = cursor.execute(sql)
    messageList = []
    for value in valuse:
        print(value)
        messageList.append(value)
    # 提交事物
    conn.commit()
    # 关闭游标
    cursor.close()
    # 关闭连接
    conn.close()
    return messageList


def delete_conn(id):
    # 连接数据库(如果不存在则创建)
    conn = sqlite3.connect('message.db')
    # 创建游标
    cursor = conn.cursor()
    # delete from 表名 where 列=?
    cursor.execute("delete from message where id=?", (id,))  # 逗号不能省，元组元素只有一个的时候一定要加逗号,将删除lucy
    # 提交事物
    conn.commit()
    # 关闭游标
    cursor.close()
    # 关闭连接
    conn.close()


class PostForm(FlaskForm):
    title = StringField('Title')
    body = CKEditorField('Body', validators=[DataRequired()])
    submit = SubmitField('Submit')


@app.route('/edit1', methods=['GET', 'POST'])
def edit1():
    form = PostForm()
    if form.validate_on_submit():
        title = form.title.data
        body = form.body.data
        # 将数据插入数据库
        try:
            insert_conn(title, body, table='message')
        except Exception as e:
            pass
        # 将title与body显示在留言墙
        return redirect(url_for("message"))
        # return render_template('edit_post.html', title=title, body=body)
    return render_template('edit1.html', form=form)


# 登陆验证成功跳转文件上传
@app.route('/login', methods=['POST', 'GET'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    if request.method == 'POST':
        user_info = request.form.to_dict()
        username = user_info['u']
        password = user_info['p']
        if username == 'upload' and password == 'aini3333nian.':
            return redirect(url_for('upload'))
        elif username == 'delete' and password == 'aini3333nian.':
            return redirect(url_for('delete'))
        elif username == 'english' and password == 'aini3333nian.':
            return redirect(url_for('english'))
        else:
            return redirect(url_for('login'))


# md文件上传
@app.route('/upload', methods=['POST', 'GET'])
def upload():
    if request.method == 'POST':
        f = request.files['file']
        basepath = os.path.dirname(__file__)  # 当前文件所在路径
        upload_path = os.path.join(basepath, 'static/mdDoc/', f.filename)  # 注意：没有的文件夹一定要先创建，不然会提示没有该路径
        f.save(upload_path)
        return redirect(url_for('upload'))
    return render_template("upload.html")


# 编辑留言墙(对数据库进行操作)
@app.route('/delete', methods=["POST", "GET"])
def delete():
    if request.method == 'POST':
        data = request.form.to_dict()
        id = data['u']
        try:
            delete_conn(id)
        except:
            pass
        return render_template('delete.html')
    return render_template("delete.html")


# 前端展示我在阅读英文文档过程中看不懂的句子
@app.route('/edit2', methods=['GET', 'POST'])
def edit2():
    form = PostForm()
    if form.validate_on_submit():
        title = form.title.data
        body = form.body.data
        # 将数据插入数据库
        try:
            insert_conn(title, body, table='english')
        except Exception as e:
            pass
        # 将title与body显示在留言墙
        return redirect(url_for("english"))
        # return render_template('edit_post.html', title=title, body=body)
    return render_template('edit2.html', form=form)


@app.route('/english')
def english():
    # 查询数据库中的英语句子
    messageList = select_conn(table='english')
    # 将title与body显示在留言墙
    return render_template('english.html', messageList=messageList)


# 上侧栏的网页们
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/talk')
def message():
    # 查询数据库中的留言
    messageList = select_conn(table='message')
    # 将title与body显示在留言墙
    return render_template('message.html', messageList=messageList)


@app.route('/visual')
def visual():
    return render_template('visual.html')


@app.route('/box')
def toolsbox():
    return render_template('toolsbox.html')


@app.route('/about')
def about():
    return render_template('about.html')


@app.route('/notes/<name>')
def displayMD(name):
    content = createMD('static/mdDoc/{}.md'.format(name))  # markdown文件的路径
    return render_template('displayMD.html', **locals())


@app.route('/lion')
def lion():
    return render_template('lion.html')


# 将md笔记文件显示为html
def createMD(filename):
    exts = ['markdown.extensions.extra', 'markdown.extensions.codehilite', 'markdown.extensions.tables',
            'markdown.extensions.toc']
    mdcontent = ""
    with open(filename, 'r', encoding='utf-8') as f:
        mdcontent = f.read()

    html = markdown.markdown(mdcontent, extensions=exts)
    content = Markup(html)
    return content


@app.route('/music')
def music():
    path = './static/music/'
    all_files = os.listdir(path)
    music_list = []
    for i in all_files:
        try:
            x = re.findall(r'(.*?).mp3', i)[0]
            music_list.append(x)
            random.shuffle(music_list)
        except Exception as e:
            pass
    return render_template('music.html', music_list=music_list)


if __name__ == "__main__":
    app.run(debug=True)
