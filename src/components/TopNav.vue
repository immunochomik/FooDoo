
<template>
    <!-- Navigation -->
    <nav class="navbar navbar-default navbar-fixed-top">
        <div class="container-fluid">
            <div class="navbar-header">
                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="#">{{title}}</a>
            </div>
            <div id="navbar" class="navbar-collapse collapse">
                <ul class="nav navbar-nav navbar-right">
                    <li id="nav-li-1" class="active nav-li" @click="toggleActive('nav-li-1')"><a href="/#!/current">Current Tasks<span class="sr-only">(current)</span></a></li>
                    <li id="nav-li-2" class="nav-li" @click="toggleActive('nav-li-2')"><a href="/#!/calendar">Calendar</a></li>
                    <li id="nav-li-3" class="nav-li" @click="toggleActive('nav-li-3')"><a href="/#!/todo">ToDo</a></li>
                    <li id="nav-li-4" class="nav-li" @click="toggleActive('nav-li-4')"><a href="/#!/analysis">Analysis</a></li>
                    <li id="nav-li-5" class="nav-li" @click="toggleActive('nav-li-5')"><a href="/#!/data">Data</a></li>
                </ul>
            </div><!--/.nav-collapse -->
        </div><!--/.container-fluid -->
    </nav>
</template>

<script>
    export default {
        name: 'TopNav',
        methods: {
            toggleActive : function(id) {
                $('.nav-li').removeClass('active');
                $('#' + id).addClass('active');
            }
        },
        data : function () {
            return {
                title: 'Foo Doo'
            }
        }
    }
</script>

<style>
</style>
