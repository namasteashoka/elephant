(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('MainController', MainController);

    /** @ngInject */
    function MainController(CommonInfo, $http, growl, $state, $log, $localStorage, $window, _, moment) {
        var vm = this;

        vm.showOtpField = false;
        vm.homeLearnSelected = 0;
        vm.loginStage = 1;
        vm.testimonials = [];
        vm.notesList = [];
        vm.allCourses = [];
        vm.stars = [1, 2, 3, 4, 5];
        vm.student = {
            student_id: '',
            emailorphone: '',
            password: '',
            phone: ''
        };
        vm.verification = {
            OTP: '',
            student_id: '',
            phone: ''
        };

        vm.mainBanners = [{
            text: "Asdcvdfj",
            src: "https://flavido.com/wp-content/uploads/2017/06/pendrive_courses.jpg"
        }, {
            text: "xbthr",
            src: "https://flavido.com/wp-content/uploads/2017/07/1200x400_slider_1200x400.jpg"
        }, {
            text: "ertrert",
            src: "https://flavido.com/wp-content/uploads/2017/06/sociology_big_ban_1200x400.jpg"
        }, {
            text: "xvxcvxvxc",
            src: "https://flavido.com/wp-content/uploads/2017/06/big_banner_anthro-2.jpg"
        }];

        vm.login = login;
        vm.otpVerification = otpVerification;
        vm.sendOTP = sendOTP;
        vm.showCourseDetails = showCourseDetails;

        activate();

        function activate() {
            vm.height = $window.innerHeight;
            vm.width = $window.innerWidth;
            getTestimonials();
            //getAllCourses();
            gethomeCategories();
            gethomeCourses();
            var studentInfo = CommonInfo.getInfo('studentInfo');
            if (studentInfo && studentInfo.userId) {
                $state.go('dashboard');
            } else {
                $state.go('main');
            }
        }

        function login() {
            if (vm.student.emailorphone && vm.student.password) {
                $http.post(CommonInfo.getAppUrl() + "/studentlogin", vm.student).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                //growl.success('Login Successfuly');
                                CommonInfo.setInfo('studentInfo', response.data.data);
                                $state.go('dashboard');
                                location.reload();
                            } else if (response.data.status == 3) {
                                //CommonInfo.setInfo('studentInfo', response.data.data);
                                vm.verification.student_id = response.data.data.userId;
                                vm.student.student_id = response.data.data.userId;
                                vm.verification.phone = response.data.data.mobile;
                                if(response.data.message == '1')
                                    vm.showOtpField = true;
                                vm.loginStage = 2;
                                // if (response.data.message == '2') {
                                //     vm.loginStage = 2;
                                // }
                            } else if (response.data.status == 2) {
                                growl.info(response.data.message);
                            }
                        } else {
                            growl.warning('There is some issue, please try after some time');
                        }
                    },
                    function(response) {
                        growl.warning('There is some issue, please try after some time');
                    }
                );
            }
        }

        function otpVerification() {
            if (vm.verification && vm.verification.OTP && vm.verification.student_id && vm.verification.phone) {
                $http.post(CommonInfo.getAppUrl() + "/verifyotp", vm.verification).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                growl.success(response.data.message);
                                CommonInfo.setInfo('studentInfo', response.data.data);
                                $state.go('dashboard');
                                location.reload();
                            } else if (response.data.status == 2) {
                                growl.info(response.data.message);
                            }
                        } else {
                            growl.warning('There is some issue, please try after some time');
                        }
                    },
                    function(response) {
                        growl.warning('There is some issue, please try after some time');
                    }
                );
            }
        }

        function sendOTP() {
            if (vm.verification && vm.verification.phone && vm.verification.student_id) {
                $http.post(CommonInfo.getAppUrl() + "/verifymobileandsendotp", vm.verification).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                growl.success('OTP send');
                                vm.showOtpField = true;
                            } else if (response.data.status == 2) {
                                growl.info(response.data.message);
                            }
                        } else {
                            growl.warning('There is some issue, please try after some time');
                        }
                    },
                    function(response) {
                        growl.warning('There is some issue, please try after some time');
                    }
                );
            }
        }

        function getTestimonials() {
            $http.post(CommonInfo.getAppUrl() + "/getactivetestimonials", {}).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.testimonials = response.data.data;
                            _.forEach(vm.testimonials, function(value, key){
                                value.charCount = (value.testimonial.length > 240) ? 230 : '';
                            });
                        } else if (response.data.status == 2) {
                            $log.log(response.data.message);
                        }
                    } else {
                        $log.log('unable to fetch testimonials');
                    }
                },
                function(response) {
                    $log.log('unable to fetch testimonials');
                }
            );
        }

        function getAllCourses() {
            $http.post(CommonInfo.getAppUrl() + "/searchcourses", { status: 1 }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.allCourses = response.data.data;
                            _.forEach(vm.allCourses, function(value) {
                                value.courseStartDate = moment(value.courseStartDate).format("YYYY-MM-DD hh:mm");
                                value.courseEndDate = moment(value.courseEndDate).format("YYYY-MM-DD hh:mm");
                                //value.durationParameterText = _.map(_.filter(vm.unitDurations, { 'value': value.durationParameter }), 'name')[0];
                                //value.instructor = _.find(vm.allInstructors, { 'id': value.instructorId });
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

        function gethomeCategories() {
            $http.post(CommonInfo.getAppUrl() + "/gethomepagecategories", { status: 1 }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.homeCategories = _.filter(response.data.data, { 'parentId': 0 });
                            _.forEach(vm.homeCategories, function(value, key){
                                value.childCategories = _.filter(response.data.data, { 'parentId': value.id });
                            });
                        } else if (response.data.status == 2) {
                            growl.info(response.data.message);
                        }
                    } else {
                        growl.warning('There is some issue, please try after some time');
                    }
                },
                function(response) {
                    growl.warning('There is some issue, please try after some time');
                }
            );
        }

        function gethomeCourses() {
            $http.post(CommonInfo.getAppUrl() + "/searchcourses", { showOnhome: 1 }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.homeCourses = response.data.data;
                        } else if (response.data.status == 2) {
                            growl.info(response.data.message);
                        }
                    } else {
                        growl.warning('There is some issue, please try after some time');
                    }
                },
                function(response) {
                    growl.warning('There is some issue, please try after some time');
                }
            );
        }

        function showCourseDetails(course) {
            if (course) {
                CommonInfo.setInfo('selectedCourseId', course.id);
                CommonInfo.setInfo('courseSearchCriteria', vm.courseSearchCriteria);
                $state.go('courseDetails', { name: course.title.replace(/ /g, "-"), id: course.id })
            }
        }
    }
})();
