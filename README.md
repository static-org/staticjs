## StaticJS

Static is a dynamic JavaScript framework that brings together all that's wrong about other frameworks!

### Who's it for?

Do you feel like...

- AngularJS lets people abuse the $scope? **Wait until you see what we've got for you!**
- React has a "licensing" problem? **We encourage you to read [StricJS license](https://github.com/static-org/staticjs/blob/master/LICENSE.md)**
- Vue is maintained by few people? **Hey... It's just me here!**
- Angular 2/4 introduced too many breaking changes? **Wait until you see the StaticJS v1.01 spec...**

If you've answered yes to some of the above questions, than StaticJS **is not** for you. In that case, we encourage you to write your own JS framework and market the shit out of it until it becomes the next soon-to-be-big-thing-thats-going-to-be-forgotten-in-about-2-months-time!

### Usage

StaticJS is so simple, it can be explained with just one example:
```
<!DOCTYPE html>
<html>
    <head>
       <script src="static.js"></script>
    </head>
<body>
    <div data-static-ctrl="test-cont">
        <form>
            <h1 data-static-if="showTitle">Page title: {{title}}</h1>
            
            <p>
                <label for="name">Name: </label>
                <input type="text" data-static-model="name">
            </p>
            
            <p>
                <label for="name">Surname: </label>
                <input type="text" data-static-model="surname">
            </p>
            
            <p>
                <label for="name">Show Title: </label>
                <input type="checkbox" data-static-model="showTitle">
            </p>
            
            <p>
                <span>This is your name: {{name}} {{surname}}</span>
            </p>
            
            <p>
                <button data-static-click="alertSurname">ALERT!!!</button>
                <button data-static-click="changeSurname">Change Surname</button>
            </p>
        </form>
    </div>

    <script type="text/javascript">
        staticjs.controller('test-cont', function myCtrl() {
            var self = this;

            self.name = 'Just a Name';
            self.surname = 'Just a Surname';
            self.title = 'Just a title';

            self.showTitle = true;

            self.getSurname = function getSurname() {
                return self.surname;
            }

            self.alertSurname = function getSurname() {
                alert(self.surname);
            }

            self.changeSurname = function getSurname() {
                self.surname = "A new Surname";
            }
        });
    </script>
</body>
</html>

```

For more detail, please go to our [wiki page](https://github.com/static-org/staticjs/wiki/Usage)
