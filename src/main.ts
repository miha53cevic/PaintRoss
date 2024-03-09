import $ from 'jquery';
import { mat2 } from 'gl-matrix';

$(function () {
    $('#app').html('Hello World');
});

const m = mat2.create();
console.log(m);