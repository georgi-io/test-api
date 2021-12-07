ThisBuild / version := "0.1.0-SNAPSHOT"

ThisBuild / scalaVersion := "3.1.0"

lazy val root = (project in file("."))
  .settings(
    name := "test-api",
    idePackagePrefix := Some("io.georgi.test-api")
  )
