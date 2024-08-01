create database attendance_project;

use attendance_project;
show tables;
delete from face_encoding where student_exam_number = 8889021;
select * from course;
select * from course_and_class;
select * from face_encoding;
select * from student where student_exam_number in (select student_exam_number from face_encoding);
select * from student;
select * from attendance;
select * from student;
select * from course_session;
select * from class;
describe attendance;

create table Face_Encoding(
	id int primary key,
	student_exam_number int not null,
    encoding text not null,
    foreign key (student_exam_number) references student(student_exam_number) on delete cascade
);

drop table if exists face_encoding;

-- inserting classes manually
insert into class values ('CS3',3,'Computer Science', 'Faculty of Physical and Computational Science', 'College of Science');
insert into class values ('CS1',1,'Computer Science', 'Faculty of Physical and Computational Science', 'College of Science');
insert into class values ('CS2',2,'Computer Science', 'Faculty of Physical and Computational Science', 'College of Science');
insert into class values ('CS4',4,'Computer Science', 'Faculty of Physical and Computational Science', 'College of Science');


--  inserting courses
insert into course values ('CSM151','Information Technology I',1);
insert into course values ('CSM165','Discrete Mathematics',1);
insert into course values ('CSM260','Database Concepts  Technologies II',2);
insert into course values ('CSM292','System Analysis and Design',2);
insert into course values ('CSM354','Computer Graphics',3);
insert into course values ('CSM352','Computer Architecture',3);
insert into course values ('CSM358','E-commerce',3);
insert into course values ('CSM388','Data Structures II',3);
insert into course values ('CSM394','Operations Research II',3);
insert into course values('CSM357','Human Computer Interaction',3);




delete from student where student_exam_number = 8111023;

insert into course_and_class values (1,'CS2','CSM254');
insert into course_and_class(class_id,course_code) values ('CS2','CSM290');
insert into course_and_class(class_id,course_code) values ('CS2','CSM290');
insert into course_and_class(class_id,course_code) values ('CS2','CSM290');
select * from course_and_class;