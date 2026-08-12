package com.example.auction;

import org.junit.platform.suite.api.SelectPackages;
import org.junit.platform.suite.api.Suite;
import org.junit.platform.suite.api.SuiteDisplayName;

@Suite
@SuiteDisplayName("Controller and Service Tests")
@SelectPackages({
        "com.example.auction.Controllers",
        "com.example.auction.Services"
})
public class ControllerServiceSuite {

}
