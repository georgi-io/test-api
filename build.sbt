enablePlugins(JavaAppPackaging)
enablePlugins(DockerPlugin)
enablePlugins(AshScriptPlugin)

lazy val commonSettings = Seq(
  organization := "io.georgi",
  version := "0.0.5-SNAPSHOT",
  scalaVersion := "3.1.0",
  turbo := true,
  scalacOptions := Seq("-unchecked", "-deprecation", "-encoding", "utf8"),

)

lazy val dockerSettings = Seq(
  dockerBaseImage := "openjdk:jre-alpine",
  dockerRepository := Some("927485958639.dkr.ecr.eu-central-1.amazonaws.com"),
  dockerUpdateLatest := true,
  dockerExposedPorts := Seq(9000),
//  THIS HAS TO BE SET
  packageName := "test-api-f8c7b69"
)

lazy val root = (project in file("."))
  .settings(commonSettings: _*)
  .settings(
    name := "Test API",
    Compile / mainClass := Some("io.georgi.testapi.TestAPI"),
    libraryDependencies ++= rootDependencies,
    dockerSettings
  )

lazy val rootDependencies = {
  val akkaHttpV = "10.2.7"
  val akkaV = "2.6.17"
  val scalaTestV = "3.2.10"

  Seq(
    "org.scalatest" %% "scalatest" % scalaTestV % "test"
  ) ++ Seq(
    "com.typesafe.akka" %% "akka-stream" % akkaV,
    "com.typesafe.akka" %% "akka-actor" % akkaV,
    "com.typesafe.akka" %% "akka-http" % akkaHttpV,
    "com.typesafe.akka" %% "akka-http-spray-json" % akkaHttpV,
    "com.typesafe.akka" %% "akka-http-testkit" % akkaHttpV % "test"
  ).map(_.cross(CrossVersion.for3Use2_13))
}

Revolver.settings
