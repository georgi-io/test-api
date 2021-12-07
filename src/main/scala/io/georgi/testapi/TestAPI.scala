package io.georgi.testapi

import akka.actor.ActorSystem
import akka.event.{Logging, LoggingAdapter}
import akka.http.scaladsl.{Http, ServerBuilder}
import akka.http.scaladsl.model.{ContentTypes, HttpEntity}
import akka.http.scaladsl.server.Directives.logRequestResult
import akka.http.scaladsl.server.Route
import com.typesafe.config.{Config, ConfigFactory}
import akka.http.scaladsl.model.StatusCodes.*
import akka.http.scaladsl.server.Directives.*

import scala.concurrent.ExecutionContext
import scala.io.StdIn

case class Message(message: String)

class API()(using system: ActorSystem, executor: ExecutionContext, logger: LoggingAdapter):
  val route: Route =
    path("")(get(complete(HttpEntity(ContentTypes.`text/html(UTF-8)`, "Test API Result"))))

object TestAPI extends App :
  given system: ActorSystem = ActorSystem("test-api-system")

  given executor: ExecutionContext = system.dispatcher

  given logger: LoggingAdapter = Logging(system, "test-api")

  val config = ConfigFactory.load()

  logger.info("TestAPI is starting")
  val bindingFuture = Http().newServerAt(config.getString("http.interface"), config.getInt("http.port")).bind(API().route)



