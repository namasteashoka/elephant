(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('CourseSearchController', CourseSearchController);

    /** @ngInject */
    function CourseSearchController(CommonInfo, $http, $state, _, $log, moment, $stateParams) {
        var vm = this;

        vm.allCourses = [];
        vm.allInstructors = [];
        vm.selectedInstructor = 'All Instructors';
        vm.courseSearchCriteria = {};

        vm.getAllCourses = getAllCourses;
        vm.searchCoursesByInstructor = searchCoursesByInstructor;
        vm.searchCoursesByText = searchCoursesByText;

        vm.showCourseDetails = showCourseDetails;
        vm.showAllCourses = showAllCourses;

        activate();

        function activate() {
            getAllCategories();
            getAllInstructors();
            getAllCourses();
            getUpcommingCourses();
        }

        function getAllInstructors() {
            $http.post(CommonInfo.getAppUrl() + "/getallusers", { type: 3 }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.allInstructors = response.data.data;
                        } else if (response.data.status == 2) {
                            $log.log(response.data.message);
                        }
                    } else {
                        $log.log('There is some issue, please try after some time');
                    }
                },
                function(response) {
                    $log.log('There is some issue, please try after some time');
                }
            );
        }

        function searchCoursesByInstructor(instructor) {
            if (instructor) {
                vm.courseSearchCriteria.instructorId = instructor.id;
                vm.selectedInstructor = instructor.fullName;
                $state.go('courses.search', { param: 'instructor', value: instructor.id });
            } else {
                vm.courseSearchCriteria.instructorId = '';
                vm.selectedInstructor = 'All Instructors';
                $state.go('courses.list');
            }
            getAllCourses();
        }

        function searchCoursesByText() {
            vm.courseSearchCriteria.name = vm.searchText;
            $state.go('courses.search', { param: 'search', value: vm.searchText });
            getAllCourses();
        }

        function getAllCourses() {
            var param = $stateParams.param;
            var value = $stateParams.value;
            var name = $stateParams.name ? $stateParams.name.replace(/-/g, " ") : '';
            if (param && value) {
                if(param == 'category'){
                    vm.courseSearchCriteria['categoryId'] = value;
                }
                else if(param == 'instructor'){
                    vm.courseSearchCriteria['instructorId'] = value;
                    vm.selectedInstructor = name;
                }
                else if(param == 'search')
                    vm.courseSearchCriteria['name'] = value;
                console.log(vm.courseSearchCriteria);
            } else {
                $state.go('courses.list');
            }
            $http.post(CommonInfo.getAppUrl() + "/searchcourses", vm.courseSearchCriteria).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.allCourses = response.data.data;
                            _.forEach(vm.allCourses, function(value) {
                                value.courseStartDate = moment(value.courseStartDate).format("YYYY-MM-DD hh:mm");
                                value.courseEndDate = moment(value.courseEndDate).format("YYYY-MM-DD hh:mm");
                            });
                        } else if (response.data.status == 2) {
                            $log.log(response.data.message);
                        }
                    } else {
                        $log.log('There is some issue, please try after some time');
                    }
                },
                function(response) {
                    $log.log('There is some issue, please try after some time');
                }
            );
        }

        function getUpcommingCourses() {
            $http.get(CommonInfo.getAppUrl() + "/upcomingcourses").then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.allUpcommingCourses = response.data.data;
                            _.forEach(vm.allUpcommingCourses, function(value) {
                                value.courseStartDate = moment(value.courseStartDate).format("YYYY-MM-DD hh:mm");
                                value.courseEndDate = moment(value.courseEndDate).format("YYYY-MM-DD hh:mm");
                                value.durationParameterText = _.map(_.filter(vm.unitDurations, { 'value': value.durationParameter }), 'name')[0];
                                value.instructor = _.find(vm.allInstructors, { 'id': value.instructorId });
                            });
                        } else if (response.data.status == 2) {
                            $log.log(response.data.message);
                        }
                    } else {
                        $log.log('There is some issue, please try after some time');
                    }
                },
                function(response) {
                    $log.log('There is some issue, please try after some time');
                }
            );
        }

        function getAllCategories() {
            $http.get(CommonInfo.getAppUrl() + "/getactivecoursecats").then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.categories = response.data.data;
                        } else if (response.data.status == 2) {
                            $log.log(response.data.message);
                        }
                    } else {
                        $log.log('There is some issue, please try after some time');
                    }
                },
                function(response) {
                    $log.log('There is some issue, please try after some time');
                }
            );
        }

        function showCourseDetails(course) {
            if (course) {
                CommonInfo.setInfo('selectedCourseId', course.id);
                CommonInfo.setInfo('courseSearchCriteria', vm.courseSearchCriteria);
                $state.go('courseDetails', { name: course.title.replace(/ /g, "-"), id: course.id });
            }
        }

        function showAllCourses() {
            $state.go('courses.search', { query: '123' });
        }
    }
})();
