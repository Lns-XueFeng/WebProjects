import sqlite3 #引入sqlite3
import sqlite3
from flask import Flask, render_template, request, url_for, flash, redirect

app = Flask(__name__)
app.config['SECRET_KEY'] = 'maishu is fat again, 555'


# 创建一个函数用来获取数据库链接
def get_db_connection():
    # 创建数据库链接到database.db文件
    conn = sqlite3.connect('database.db')
    # 设置数据的解析方法，有了这个设置，就可以像字典一样访问每一列数据
    conn.row_factory = sqlite3.Row
    return conn

# 根据post_id从数据库中获取post
def get_post(post_id):
    conn = get_db_connection()
    post = conn.execute('SELECT * FROM posts WHERE id = ?',
                        (post_id,)).fetchone()
    conn.close()
    return post

@app.route('/')
def welecome():
    return render_template('welecome.html')


@app.route('/index')
def index():
    # 调用上面的函数，获取链接
    conn = get_db_connection()
    # 查询所有数据，放到变量posts中
    posts = conn.execute('SELECT * FROM posts').fetchall()
    conn.close()
    #把查询出来的posts传给网页
    return render_template('index.html', posts=posts)  


@app.route('/posts/<int:post_id>')
def post(post_id):
    post = get_post(post_id)
    return render_template('post.html', post=post)


@app.route('/posts/new', methods=('GET', 'POST'))
def new():
    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']

        if not title:
            flash('标题不能为空!')
        elif not content:
            flash('内容不能为空')
        else:
            conn = get_db_connection()
            conn.execute('INSERT INTO posts (title, content) VALUES (?, ?)',
                         (title, content))
            conn.commit()
            conn.close()
            return redirect(url_for('index'))

    return render_template('new.html')


@app.route('/posts/<int:id>/edit', methods=('GET', 'POST'))
def edit(id):
    post = get_post(id)

    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']

        if not title:
            flash('Title is required!')
        else:
            conn = get_db_connection()
            conn.execute('UPDATE posts SET title = ?, content = ?'
                         ' WHERE id = ?',
                         (title, content, id))
            conn.commit()
            conn.close()
            return redirect(url_for('index'))

    return render_template('edit.html', post=post)


@app.route('/posts/<int:id>/delete', methods=('POST',))
def delete(id):
    post = get_post(id)
    conn = get_db_connection()
    conn.execute('DELETE FROM posts WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    flash('"{}" 删除成功!'.format(post['title']))
    return redirect(url_for('index'))

@app.route('/about')
def about():
    return render_template('about.html')

if __name__ == "__main":
    app.run()